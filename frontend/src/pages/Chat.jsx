import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, ListGroup, Form, Button, Badge, Dropdown, Spinner, InputGroup, Modal } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useLocation, useNavigate } from 'react-router-dom';
import chatService from '../services/chatService';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import NewChatModal from '../components/chat/NewChatModal';
import './Chat.css';

const Chat = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const location = useLocation();
    const navigate = useNavigate();
    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(location.state?.selectedConversation || null);
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [stompClient, setStompClient] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUsers, setTypingUsers] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewChatModal, setShowNewChatModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [conversationToDelete, setConversationToDelete] = useState(null);
    const [loading, setLoading] = useState(false);
    const [conversationSearch, setConversationSearch] = useState('');
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    useEffect(() => {
        loadConversations();
        connectWebSocket();
        return () => stompClient?.deactivate();
    }, []);

    useEffect(() => {
        if (location.state?.selectedConversation) {
            setSelectedConversation(location.state.selectedConversation);
            loadConversations();
        }
    }, [location.state]);

    useEffect(() => {
        if (selectedConversation) {
            loadMessages(selectedConversation.conversationId);
            chatService.markAsRead(selectedConversation.conversationId).then(() => {
                // Update the conversation in the list to reflect unread count = 0
                setConversations(prev => prev.map(conv => 
                    conv.conversationId === selectedConversation.conversationId 
                        ? { ...conv, unreadCount: 0 } 
                        : conv
                ));
                window.dispatchEvent(new Event('chatRead'));
            });
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [selectedConversation]);

    const connectWebSocket = () => {
        const token = localStorage.getItem('token');
        const client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: { Authorization: `Bearer ${token}` },
            onConnect: () => {
                console.log('WebSocket connected');
                setStompClient(client);
            }
        });
        client.activate();
    };

    useEffect(() => {
        if (stompClient && selectedConversation) {
            const subscription = stompClient.subscribe(
                `/topic/conversation/${selectedConversation.conversationId}`,
                (message) => {
                    const newMessage = JSON.parse(message.body);
                    setMessages(prev => {
                        const exists = prev.some(m => 
                            m.messageId === newMessage.messageId || 
                            (m.content === newMessage.content && m.sender.userId === newMessage.sender.userId)
                        );
                        if (exists) return prev;
                        return [...prev, newMessage];
                    });
                    // Only mark as read if message is from someone else
                    if (newMessage.sender.userId !== user.userId) {
                        chatService.markAsRead(selectedConversation.conversationId);
                        // Update conversations list
                        loadConversations();
                    }
                }
            );

            const typingSub = stompClient.subscribe(
                `/topic/conversation/${selectedConversation.conversationId}/typing`,
                (message) => {
                    const data = JSON.parse(message.body);
                    if (data.userId !== user.userId) {
                        if (data.isTyping) {
                            setTypingUsers(prev => new Set(prev).add(data.userName));
                        } else {
                            setTypingUsers(prev => {
                                const newSet = new Set(prev);
                                newSet.delete(data.userName);
                                return newSet;
                            });
                        }
                    }
                }
            );

            return () => {
                subscription.unsubscribe();
                typingSub.unsubscribe();
            };
        }
    }, [stompClient, selectedConversation]);

    const loadConversations = async () => {
        try {
            const data = await chatService.getConversations();
            setConversations(data);
            window.dispatchEvent(new Event('chatRead'));
        } catch (error) {
            console.error('Failed to load conversations', error);
        }
    };

    const loadMessages = async (conversationId) => {
        try {
            setLoading(true);
            const data = await chatService.getMessages(conversationId);
            setMessages(data.content.reverse());
        } catch (error) {
            console.error('Failed to load messages', error);
        } finally {
            setLoading(false);
        }
    };

    const sendMessage = () => {
        if (!messageInput.trim() || !selectedConversation) return;

        const message = {
            conversationId: selectedConversation.conversationId,
            content: messageInput,
            type: 'TEXT'
        };

        // Optimistic update - add message immediately
        const optimisticMessage = {
            messageId: Date.now(), // temporary ID
            content: messageInput,
            sender: user,
            createdAt: new Date().toISOString(),
            isEdited: false,
            reactions: {}
        };
        setMessages(prev => [...prev, optimisticMessage]);

        stompClient.publish({
            destination: '/app/chat.send',
            body: JSON.stringify(message)
        });

        setMessageInput('');
        handleTyping(false);
    };

    const handleTyping = (typing) => {
        if (!selectedConversation) return;

        stompClient?.publish({
            destination: '/app/chat.typing',
            body: JSON.stringify({
                conversationId: selectedConversation.conversationId,
                userId: user.userId,
                userName: user.name,
                isTyping: typing
            })
        });
    };

    const handleInputChange = (e) => {
        setMessageInput(e.target.value);

        if (!isTyping) {
            setIsTyping(true);
            handleTyping(true);
        }

        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            handleTyping(false);
        }, 1000);
    };

    const addReaction = async (messageId, emoji) => {
        try {
            // Optimistic update
            setMessages(prev => prev.map(msg => {
                if (msg.messageId === messageId) {
                    const reactions = { ...msg.reactions };
                    if (!reactions[emoji]) {
                        reactions[emoji] = [user.name];
                    } else if (reactions[emoji].includes(user.name)) {
                        // Remove reaction if already exists
                        reactions[emoji] = reactions[emoji].filter(name => name !== user.name);
                        if (reactions[emoji].length === 0) {
                            delete reactions[emoji];
                        }
                    } else {
                        // Add reaction
                        reactions[emoji] = [...reactions[emoji], user.name];
                    }
                    return { ...msg, reactions };
                }
                return msg;
            }));
            await chatService.addReaction(messageId, emoji);
        } catch (error) {
            console.error('Failed to add reaction', error);
        }
    };

    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'auto', block: 'end', inline: 'nearest' });
        }
    };

    const getConversationName = (conversation) => {
        if (conversation.isGroup) return conversation.groupName;
        const otherUser = conversation.participants.find(p => p.userId !== user.userId);
        return otherUser?.name || 'Unknown';
    };

    const getOtherUserId = (conversation) => {
        if (conversation.isGroup) return null;
        const otherUser = conversation.participants.find(p => p.userId !== user.userId);
        return otherUser?.userId || null;
    };

    const handleUserNameClick = () => {
        if (selectedConversation.isGroup) return;
        const otherUserId = getOtherUserId(selectedConversation);
        if (otherUserId) {
            navigate(`/profile/${otherUserId}`);
        }
    };

    const filteredConversations = conversations.filter(conv => 
        getConversationName(conv).toLowerCase().includes(conversationSearch.toLowerCase())
    );

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const handleDeleteConversation = async (conversationId) => {
        setConversationToDelete(conversationId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            await chatService.deleteConversation(conversationToDelete);
            setConversations(prev => prev.filter(c => c.conversationId !== conversationToDelete));
            if (selectedConversation?.conversationId === conversationToDelete) {
                setSelectedConversation(null);
            }
            window.dispatchEvent(new Event('chatRead'));
            setShowDeleteModal(false);
            setConversationToDelete(null);
        } catch (error) {
            console.error('Failed to delete conversation', error);
            alert('Failed to delete conversation');
        }
    };

    return (
        <Container fluid className={`chat-container mt-4 ${theme === 'dark' ? 'chat-dark' : ''}`}>
            <Row className="h-100 g-0">
                <Col xs={12} md={4} className="conversations-panel d-md-block" style={{ display: selectedConversation ? 'none' : 'block' }}>
                    <Card bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                        <Card.Header className="d-flex justify-content-between align-items-center">
                            <div className="d-flex align-items-center gap-2">
                                <h5 className="mb-0">💬 Messages</h5>
                                {conversations.filter(c => c.unreadCount > 0).length > 0 && (
                                    <Badge bg="danger" pill style={{ fontSize: '0.75rem' }}>
                                        {conversations.filter(c => c.unreadCount > 0).length}
                                    </Badge>
                                )}
                            </div>
                            <Button size="sm" onClick={() => setShowNewChatModal(true)}>
                                + New
                            </Button>
                        </Card.Header>
                        <div className="p-2">
                            <Form.Control
                                type="text"
                                placeholder="🔍 Search conversations..."
                                value={conversationSearch}
                                onChange={(e) => setConversationSearch(e.target.value)}
                                size="sm"
                            />
                        </div>
                        <ListGroup variant="flush">
                            {filteredConversations.length === 0 ? (
                                <ListGroup.Item className={theme === 'dark' ? 'bg-dark text-white' : ''}>
                                    <div className="text-center text-muted py-4">
                                        <p>No conversations yet</p>
                                        <small>Click "New" to start chatting</small>
                                    </div>
                                </ListGroup.Item>
                            ) : (
                                filteredConversations.map(conv => (
                                    <ListGroup.Item
                                        key={conv.conversationId}
                                        active={selectedConversation?.conversationId === conv.conversationId}
                                        onClick={() => setSelectedConversation(conv)}
                                        className={`conversation-item ${theme === 'dark' && selectedConversation?.conversationId !== conv.conversationId ? 'bg-dark text-white' : ''}`}
                                    >
                                    <div className="d-flex justify-content-between align-items-center w-100">
                                        <strong>{getConversationName(conv)}</strong>
                                        <div className="d-flex align-items-center gap-2">
                                            {conv.unreadCount > 0 && (
                                                <Badge bg="danger" pill className="ms-2">{conv.unreadCount}</Badge>
                                            )}
                                            <span
                                                style={{ cursor: 'pointer', fontSize: '0.9rem' }}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDeleteConversation(conv.conversationId);
                                                }}
                                            >
                                                x
                                            </span>
                                        </div>
                                    </div>
                                    {conv.lastMessage && (
                                        <small className="text-muted">
                                            {conv.lastMessage.content?.substring(0, 30)}...
                                        </small>
                                    )}
                                </ListGroup.Item>
                            )))
                            }
                        </ListGroup>
                    </Card>
                </Col>

                <Col xs={12} md={8} className="chat-panel" style={{ display: !selectedConversation ? 'none' : 'block' }}>
                    {selectedConversation ? (
                        <Card className="h-100" bg={theme === 'dark' ? 'dark' : 'light'} text={theme === 'dark' ? 'white' : 'dark'}>
                            <Card.Header className="d-flex justify-content-between align-items-center">
                                <div className="d-flex align-items-center gap-2">
                                    <Button 
                                        variant="link" 
                                        className="d-md-none p-1 text-decoration-none"
                                        onClick={() => setSelectedConversation(null)}
                                        style={{ 
                                            fontSize: '1.2rem',
                                            color: theme === 'dark' ? '#fff' : '#000',
                                            minWidth: '32px',
                                            height: '32px',
                                            borderRadius: '8px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        ←
                                    </Button>
                                    <h5 
                                        className="mb-0" 
                                        style={{ cursor: !selectedConversation.isGroup && getOtherUserId(selectedConversation) ? 'pointer' : 'default' }} 
                                        onClick={handleUserNameClick}
                                    >
                                        💬 {getConversationName(selectedConversation)}
                                    </h5>
                                </div>
                                {selectedConversation.isGroup && (
                                    <span className="badge bg-secondary" style={{ cursor: 'pointer' }} onClick={() => setShowMembersModal(true)}>
                                        {selectedConversation.participants?.length || 0} members
                                    </span>
                                )}
                            </Card.Header>
                            <Card.Body className="messages-container" style={{ backgroundColor: theme === 'dark' ? '#1a1a1a' : '#f8f9fa' }}>
                                {loading ? (
                                    <div className="text-center">
                                        <Spinner animation="border" />
                                    </div>
                                ) : (
                                    <>
                                        {messages.map(msg => (
                                            <div
                                                key={msg.messageId}
                                                className={`message ${msg.sender.userId === user.userId ? 'sent' : 'received'} ${theme === 'dark' ? 'message-dark' : ''}`}
                                            >
                                                <div className="message-content">
                                                    <strong>{msg.sender.name}</strong>
                                                    <p>{msg.content}</p>
                                                    <div className="d-flex justify-content-end align-items-center gap-1">
                                                        <small>{formatTime(msg.createdAt)}</small>
                                                        {msg.isEdited && <small className="text-muted">(edited)</small>}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {typingUsers.size > 0 && (
                                            <div className="typing-indicator">
                                                {Array.from(typingUsers).join(', ')} typing...
                                            </div>
                                        )}
                                        <div ref={messagesEndRef} />
                                    </>
                                )}
                            </Card.Body>
                            <Card.Footer style={{ backgroundColor: theme === 'dark' ? '#2d2d2d' : 'white' }}>
                                <Form onSubmit={(e) => { e.preventDefault(); sendMessage(); }}>
                                    <InputGroup>
                                        <Form.Control
                                            type="text"
                                            placeholder="Type a message..."
                                            value={messageInput}
                                            onChange={handleInputChange}
                                        />
                                        <Button type="submit" variant={theme === 'dark' ? 'outline-light' : 'primary'}>Send</Button>
                                    </InputGroup>
                                </Form>
                            </Card.Footer>
                        </Card>
                    ) : (
                        <div className="text-center mt-5">
                            <div style={{ fontSize: '4rem' }}>💬</div>
                            <h4 className={theme === 'dark' ? 'text-white' : ''}>Select a conversation to start chatting</h4>
                            <p className="text-muted">Choose from your existing conversations or start a new one</p>
                        </div>
                    )}
                </Col>
            </Row>

            <NewChatModal
                show={showNewChatModal}
                onHide={() => setShowNewChatModal(false)}
                onConversationCreated={(conv) => {
                    // Check if conversation already exists in list
                    const exists = conversations.some(c => c.conversationId === conv.conversationId);
                    if (!exists) {
                        setConversations(prev => [conv, ...prev]);
                    }
                    setSelectedConversation(conv);
                }}
            />

            <Modal show={showMembersModal} onHide={() => setShowMembersModal(false)} contentClassName={theme === 'dark' ? 'bg-dark text-white' : ''}>
                <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}>
                    <Modal.Title>Group Members</Modal.Title>
                </Modal.Header>
                <Modal.Body className={theme === 'dark' ? 'bg-dark' : ''}>
                    <ListGroup variant="flush">
                        {selectedConversation?.participants?.map(participant => (
                            <ListGroup.Item 
                                key={participant.userId} 
                                className={theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                    navigate(`/profile/${participant.userId}`);
                                    setShowMembersModal(false);
                                }}
                            >
                                <div className="d-flex justify-content-between align-items-center">
                                    <div>
                                        <strong>{participant.name}</strong>
                                        <br />
                                        <small className="text-muted">{participant.email}</small>
                                    </div>
                                    {participant.userId === user.userId && (
                                        <Badge bg="primary">You</Badge>
                                    )}
                                </div>
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Modal.Body>
                <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
                    <Button variant="secondary" onClick={() => setShowMembersModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} contentClassName={theme === 'dark' ? 'bg-dark text-white' : ''}>
                <Modal.Header closeButton className={theme === 'dark' ? 'bg-dark text-white border-secondary' : ''}>
                    <Modal.Title>Delete Conversation</Modal.Title>
                </Modal.Header>
                <Modal.Body className={theme === 'dark' ? 'bg-dark' : ''}>
                    Are you sure you want to delete this conversation? This will only remove it from your view.
                </Modal.Body>
                <Modal.Footer className={theme === 'dark' ? 'bg-dark border-secondary' : ''}>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default Chat;
