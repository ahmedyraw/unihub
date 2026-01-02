import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Container, Card, Button, Badge, Alert, Modal, Form } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import blogService from '../services/blogService';
import reportService from '../services/reportService';
import { formatDate, getStatusVariant } from '../utils/helpers';
import { USER_ROLES } from '../utils/constants';

const BlogDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reportingBlog, setReportingBlog] = useState(false);
  const [hasReported, setHasReported] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    loadBlogDetails();
  }, [id]);

  const loadBlogDetails = async () => {
    try {
      const blogData = await blogService.getBlogById(id);
      setBlog(blogData);
      
      // Check if user has already reported (only for supervisors/admins)
      if (user && (user.role === USER_ROLES.SUPERVISOR || user.role === USER_ROLES.ADMIN)) {
        try {
          const reports = await reportService.getBlogReports({ blogId: id });
          const userReport = reports.find(r => r.reportedBy?.userId === user.userId || r.reportedBy?.email === user.email);
          setHasReported(!!userReport);
        } catch (err) {
          setHasReported(false);
        }
      }
    } catch (err) {
      console.error('Failed to load blog details:', err);
      setError('Failed to load blog details');
    } finally {
      setLoading(false);
    }
  };

  const handleReportBlog = async () => {
    if (!reportReason.trim()) {
      setError('Please provide a reason for reporting');
      return;
    }
    
    setReportingBlog(true);
    try {
      await reportService.reportBlog(id, reportReason);
      setSuccess('Blog reported successfully. Our team will review it.');
      setShowReportModal(false);
      setReportReason('');
      setHasReported(true);
    } catch (err) {
      if (err.response?.status === 409) {
        setError('You have already reported this blog.');
        setHasReported(true);
      } else {
        setError(err.response?.data?.message || 'Failed to report blog');
      }
    } finally {
      setReportingBlog(false);
    }
  };

  const handleAdminDelete = async () => {
    try {
      await blogService.deleteBlog(id);
      setSuccess('Blog deleted successfully');
      setShowDeleteModal(false);
      setTimeout(() => navigate('/blogs'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete blog');
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <div className="spinner-border text-primary" />
      </Container>
    );
  }

  if (!blog) {
    return (
      <Container className="py-5">
        <Alert variant="danger">Blog not found</Alert>
        <Button as={Link} to="/blogs" variant="primary">Back to Blogs</Button>
      </Container>
    );
  }

  const canReportBlog = user && blog.author?.userId !== user.userId && (blog.status === 'PENDING' || blog.status === 'APPROVED');

  return (
    <Container className="py-4">
      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      <div className="mb-3">
        <Button as={Link} to="/blogs" variant="outline-secondary" size="sm">
          ← Back to Blogs
        </Button>
      </div>

      <Card className="mb-4" style={{ position: 'relative', overflow: 'hidden' }}>
        {blog.reportCount > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '5px',
            right: '5px',
            width: '28px',
            height: '28px',
            backgroundColor: '#dc3545',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '0.875rem',
            fontWeight: '700',
            zIndex: 10,
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
          }}>
            {blog.reportCount}
          </div>
        )}
        <Card.Header>
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h2 className="mb-2">{blog.title}</h2>
              <div className="d-flex gap-2 flex-wrap">
                <Badge bg="info">{blog.category}</Badge>
                {blog.isGlobal && <Badge bg="warning">🌍 Global</Badge>}
                <Badge bg={getStatusVariant(blog.status)}>{blog.status}</Badge>
              </div>
            </div>
          </div>
        </Card.Header>
        <Card.Body>
          <div className="mb-3">
            <strong>Author:</strong> <span style={{ color: 'var(--text-primary)' }}>{blog.author?.name}</span>
            {blog.author?.university && (
              <span className="text-muted"> • {blog.author.university.name}</span>
            )}
          </div>
          <div className="mb-3">
            <strong>Published:</strong> <span style={{ color: 'var(--text-primary)' }}>{formatDate(blog.createdAt)}</span>
          </div>
          {blog.lastModifiedAt && (
            <div className="mb-3">
              <strong>Last Updated:</strong> <span style={{ color: 'var(--text-primary)' }}>{formatDate(blog.lastModifiedAt)}</span>
            </div>
          )}
          <hr style={{ borderColor: 'var(--border-color)', opacity: 1 }} />
          <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', color: 'var(--text-primary)' }}>
            {blog.content}
          </div>
        </Card.Body>
      </Card>

{/* Report Section */}
      {canReportBlog && (
        <Card className="mb-3">
          <Card.Body>
            <h5>Report This Blog</h5>
            <p className="text-muted small">If you find this blog inappropriate or violates community guidelines</p>
            <Button variant="warning" size="sm" onClick={() => setShowReportModal(true)} disabled={hasReported}>
              {hasReported ? 'Already Reported' : 'Report Blog'}
            </Button>
          </Card.Body>
        </Card>
      )}

      {/* Admin Actions */}
      {user && user.role === USER_ROLES.ADMIN && (
        <Card>
          <Card.Body>
            <h5>Admin Actions</h5>
            <div className="d-flex gap-2 flex-wrap">
              <Button variant="danger" size="sm" onClick={() => setShowDeleteModal(true)}>
                Delete Blog
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Report Modal */}
      <Modal show={showReportModal} onHide={() => setShowReportModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <Modal.Title style={{ color: 'var(--text-primary)' }}>Report Blog</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
          <p className="text-muted">You are reporting: <strong style={{ color: 'var(--text-primary)' }}>{blog.title}</strong></p>
          <Form.Group>
            <Form.Label style={{ color: 'var(--text-primary)' }}>Reason for reporting</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              placeholder="Please explain why you are reporting this blog..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <Button variant="secondary" onClick={() => setShowReportModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleReportBlog}
            disabled={reportingBlog}
          >
            {reportingBlog ? 'Reporting...' : 'Submit Report'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <Modal.Title style={{ color: 'var(--text-primary)' }}>Delete Blog</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
          <p>Are you sure you want to delete this blog? This action cannot be undone.</p>
        </Modal.Body>
        <Modal.Footer style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border-color)' }}>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleAdminDelete}>
            Delete Blog
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BlogDetails;
