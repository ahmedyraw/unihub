import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, ListGroup, Badge, Spinner } from 'react-bootstrap';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import userService from '../../services/userService';
import chatService from '../../services/chatService';

const NewChatModal = ({ show, onHide, onConversationCreated }) => {
    const { theme } = useTheme();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [conversations, setConversations] = useState([]);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [isGroup, setIsGroup] = useState(false);
    const [groupName, setGroupName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [loadingUsers, setLoadingUsers] = useState(false);

    useEffect(() => {
        if (show) {
            loadUsers();
            loadConversations();
        }
    }, [show]);

    const loadUsers = async () => {
        try {
            setLoadingUsers(true);
            const data = await userService.getAllUsers();
            setUsers(data || []);
        } catch (error) {
            console.error('Failed to load users', error);
            setUsers([]);
        } finally {
            setLoadingUsers(false);
        }
    };

    const loadConversations = async () => {
        try {
            const data = await chatService.getConversations();
            setConversations(data || []);
        } catch (error) {
            console.error('Failed to load conversations', error);
            setConversations([]);
        }
    };

    const toggleUserSelection = (userId) => {
        if (!isGroup && selectedUsers.length >= 1 && !selectedUsers.includes(userId)) {
            // For non-group chats, only allow one user
            setSelectedUsers([userId]);
        } else {
            setSelectedUsers(prev =>
                prev.includes(userId)
                    ? prev.filter(id => id !== userId)
                    : [...prev, userId]
            );
        }
    };

    const handleCreate = async () => {
        if (selectedUsers.length === 0) return;

        // Check if conversation already exists for 1-on-1 chat
        if (!isGroup && selectedUsers.length === 1) {
            const existingConv = conversations.find(conv => 
                !conv.isGroup && 
                conv.participants.length === 2 &&
                conv.participants.some(p => p.userId === selectedUsers[0])
            );
            if (existingConv) {
                onConversationCreated(existingConv);
                handleClose();
                return;
            }
        }

        try {
            setLoading(true);
            const conversation = await chatService.createConversation(
                selectedUsers,
                isGroup,
                isGroup ? groupName : null
            );
            onConversationCreated(conversation);
            handleClose();
        } catch (error) {
            console.error('Failed to create conversation', error);
            alert('Failed to create conversation');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setSelectedUsers([]);
        setIsGroup(false);
        setGroupName('');
        setSearchQuery('');
        onHide();
    };

    const filteredUsers = users
        .filter(user => user.userId !== currentUser?.userId) // Exclude current user
        .filter(user =>
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <Modal show={show} onHide={handleClose} size="lg" contentClassName={theme === 'dark' ? 'bg-dark text-white' : ''}>
            <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}>
                <Modal.Title>New Conversation</Modal.Title>
            </Modal.Header>
            <Modal.Body className={theme === 'dark' ? 'bg-dark' : ''}>
                {loadingUsers ? (
                    <div className="text-center py-4">
                        <Spinner animation="border" />
                        <p className="mt-2">Loading users...</p>
                    </div>
                ) : (
                    <>
                <Form.Group className="mb-3">
                    <Form.Control
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </Form.Group>

                <Form.Check
                    type="checkbox"
                    label="Group Chat"
                    checked={isGroup}
                    onChange={(e) => setIsGroup(e.target.checked)}
                    className="mb-3"
                />

                {isGroup && (
                    <Form.Group className="mb-3">
                        <Form.Control
                            type="text"
                            placeholder="Group name..."
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    </Form.Group>
                )}

                <div className="mb-2">
                    <strong>Selected: </strong>
                    {selectedUsers.length === 0 ? (
                        <span className="text-muted">None</span>
                    ) : (
                        selectedUsers.map(userId => {
                            const user = users.find(u => u.userId === userId);
                            return (
                                <Badge key={userId} bg="primary" className="me-1">
                                    {user?.name}
                                </Badge>
                            );
                        })
                    )}
                </div>

                <ListGroup style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    {filteredUsers.length === 0 ? (
                        <ListGroup.Item className={theme === 'dark' ? 'bg-dark text-white' : ''}>
                            <div className="text-center text-muted py-3">
                                No users found
                            </div>
                        </ListGroup.Item>
                    ) : (
                        filteredUsers.map(user => (
                        <ListGroup.Item
                            key={user.userId}
                            action
                            active={selectedUsers.includes(user.userId)}
                            onClick={() => toggleUserSelection(user.userId)}
                            className={theme === 'dark' && !selectedUsers.includes(user.userId) ? 'bg-dark text-white' : ''}
                        >
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <strong>{user.name}</strong>
                                    <br />
                                    <small className="text-muted">{user.email}</small>
                                </div>
                                {selectedUsers.includes(user.userId) && (
                                    <Badge bg="success">✓</Badge>
                                )}
                            </div>
                        </ListGroup.Item>
                    )))
                    }
                </ListGroup>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button
                    variant="primary"
                    onClick={handleCreate}
                    disabled={selectedUsers.length === 0 || loading}
                >
                    {loading ? 'Creating...' : 'Create'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default NewChatModal;
