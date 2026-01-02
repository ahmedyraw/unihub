package com.example.unihub.controller;

import com.example.unihub.dto.request.CreateBlogRequest;
import com.example.unihub.enums.BlogStatus;
import com.example.unihub.model.Blog;
import com.example.unihub.model.User;
import com.example.unihub.service.BlogService;
import com.example.unihub.service.UserService;
import com.example.unihub.util.AuthenticationUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/blogs")
@RequiredArgsConstructor
public class BlogController {

    private final BlogService blogService;
    private final UserService userService;

    /**
     * Get all blogs with optional filters
     * GET /api/blogs?universityId=1&status=APPROVED&category=ARTICLE
     */
    @GetMapping
    public ResponseEntity<List<Blog>> getAllBlogs(
            @RequestParam(required = false) Long universityId,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) BlogStatus status,
            @RequestParam(required = false) Boolean isGlobal) {
        List<Blog> blogs = blogService.getAllBlogs(universityId, category, status, isGlobal);
        return ResponseEntity.ok(blogs);
    }

    /**
     * Get blog by ID
     * GET /api/blogs/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<Blog> getBlogById(@PathVariable Long id) {
        Blog blog = blogService.getBlogById(id);
        return ResponseEntity.ok(blog);
    }

    /**
     * Create a new blog
     * POST /api/blogs
     */
    @PostMapping
    public ResponseEntity<Blog> createBlog(
            @Valid @RequestBody CreateBlogRequest request,
            Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User author = userService.getUserByEmail(email);
        Blog blog = blogService.createBlog(request, author);
        return ResponseEntity.status(HttpStatus.CREATED).body(blog);
    }

    /**
     * Update an existing blog (Author only, PENDING blogs only)
     * PUT /api/blogs/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<Blog> updateBlog(
            @PathVariable Long id,
            @Valid @RequestBody CreateBlogRequest request,
            Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User currentUser = userService.getUserByEmail(email);
        Blog blog = blogService.updateBlog(id, request, currentUser);
        return ResponseEntity.ok(blog);
    }

    /**
     * Approve a blog (Supervisor only)
     * PUT /api/blogs/{id}/approve
     */
    @PutMapping("/{id}/approve")
    public ResponseEntity<String> approveBlog(@PathVariable Long id) {
        blogService.approveBlog(id);
        return ResponseEntity.ok("Blog approved successfully");
    }

    /**
     * Reject a blog (Supervisor only)
     * PUT /api/blogs/{id}/reject
     */
    @PutMapping("/{id}/reject")
    public ResponseEntity<String> rejectBlog(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        String reason = body.getOrDefault("reason", "Not specified");
        blogService.rejectBlog(id, reason);
        return ResponseEntity.ok("Blog rejected");
    }

    /**
     * Get blogs created by current user
     * GET /api/blogs/my-blogs
     */
    @GetMapping("/my-blogs")
    public ResponseEntity<List<Blog>> getMyBlogs(Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        List<Blog> blogs = blogService.getBlogsByAuthor(user.getUserId());
        return ResponseEntity.ok(blogs);
    }

    /**
     * Get pending blogs (Supervisor only)
     * GET /api/blogs/pending
     */
    @GetMapping("/pending")
    public ResponseEntity<List<Blog>> getPendingBlogs() {
        List<Blog> blogs = blogService.getPendingBlogs();
        return ResponseEntity.ok(blogs);
    }

    /**
     * Delete a blog (Author or Admin only)
     * DELETE /api/blogs/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteBlog(
            @PathVariable Long id,
            Authentication authentication) {
        String email = AuthenticationUtil.getEmailFromAuthentication(authentication);
        User user = userService.getUserByEmail(email);
        blogService.deleteBlog(id, user);
        return ResponseEntity.ok("Blog deleted successfully");
    }
}
