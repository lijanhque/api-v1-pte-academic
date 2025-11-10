'use client';

import { Heart, MessageCircle, Share2, Bookmark, TrendingUp, Users, Hash } from 'lucide-react';
import { useState } from 'react';

const mockPosts = [
  {
    id: 1,
    author: {
      name: 'Sarah Johnson',
      avatar: 'SJ',
      score: 85,
      level: 'Advanced',
    },
    content: 'Just completed my first mock test! Got 75 overall. Any tips for improving my speaking score? 🎯',
    timestamp: '2 hours ago',
    likes: 24,
    comments: 8,
    tags: ['speaking', 'tips', 'mock-test'],
  },
  {
    id: 2,
    author: {
      name: 'Michael Chen',
      avatar: 'MC',
      score: 79,
      level: 'Advanced',
    },
    content: 'Sharing my template for "Describe Image" questions. This helped me improve from 60 to 80! The introduction is key - always start with "The image illustrates..." 📊',
    timestamp: '5 hours ago',
    likes: 156,
    comments: 32,
    tags: ['templates', 'speaking', 'describe-image'],
    isPopular: true,
  },
  {
    id: 3,
    author: {
      name: 'Priya Sharma',
      avatar: 'PS',
      score: 90,
      level: 'Expert',
    },
    content: 'Finally achieved my target score of 90! Thank you all for the support. Happy to answer questions about reading section! 🎉',
    timestamp: '1 day ago',
    likes: 342,
    comments: 67,
    tags: ['success-story', 'reading', 'motivation'],
    isPopular: true,
  },
];

const trendingTopics = [
  { tag: 'speaking-tips', posts: 234 },
  { tag: 'essay-templates', posts: 189 },
  { tag: 'mock-test-review', posts: 156 },
  { tag: 'listening-practice', posts: 143 },
  { tag: 'success-stories', posts: 98 },
];

const topContributors = [
  { name: 'Alex Kumar', posts: 45, helpful: 234 },
  { name: 'Emma Watson', posts: 38, helpful: 198 },
  { name: 'David Lee', posts: 32, helpful: 176 },
];

export default function CommunityPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'trending' | 'following'>('feed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">PTE Community</h1>
        <p className="mt-2 text-muted-foreground">
          Connect with fellow PTE learners, share tips, and grow together
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Feed */}
        <div className="lg:col-span-2 space-y-6">
          {/* Create Post */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                YOU
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Share your PTE journey, tips, or questions..."
                  className="w-full rounded-lg border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-2">
                    <button className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent">
                      📷 Photo
                    </button>
                    <button className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent">
                      🎯 Poll
                    </button>
                    <button className="rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-accent">
                      #️⃣ Tag
                    </button>
                  </div>
                  <button className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                    Post
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 border-b">
            <button
              onClick={() => setActiveTab('feed')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'feed'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'trending'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Trending
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTab === 'following'
                  ? 'border-b-2 border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Following
            </button>
          </div>

          {/* Posts Feed */}
          <div className="space-y-4">
            {mockPosts.map((post) => (
              <div key={post.id} className="rounded-lg border bg-card p-6 transition-shadow hover:shadow-md">
                {/* Post Header */}
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-sm font-bold text-white">
                      {post.author.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{post.author.name}</h4>
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          {post.author.level}
                        </span>
                        {post.isPopular && (
                          <TrendingUp className="h-4 w-4 text-orange-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Score: {post.author.score}</span>
                        <span>•</span>
                        <span>{post.timestamp}</span>
                      </div>
                    </div>
                  </div>
                  <button className="text-muted-foreground hover:text-foreground">
                    <Bookmark className="h-5 w-5" />
                  </button>
                </div>

                {/* Post Content */}
                <p className="mb-4 text-sm leading-relaxed">{post.content}</p>

                {/* Tags */}
                <div className="mb-4 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1 text-xs font-medium"
                    >
                      <Hash className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Post Actions */}
                <div className="flex items-center gap-6 border-t pt-4">
                  <button className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-red-500">
                    <Heart className="h-5 w-5" />
                    <span>{post.likes}</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-blue-500">
                    <MessageCircle className="h-5 w-5" />
                    <span>{post.comments}</span>
                  </button>
                  <button className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-green-500">
                    <Share2 className="h-5 w-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Trending Topics */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              Trending Topics
            </h3>
            <div className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <button
                  key={topic.tag}
                  className="flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors hover:bg-accent"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-muted-foreground">
                      {index + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">#{topic.tag}</p>
                      <p className="text-xs text-muted-foreground">
                        {topic.posts} posts
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Top Contributors */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-semibold">
              <Users className="h-5 w-5 text-blue-500" />
              Top Contributors
            </h3>
            <div className="space-y-3">
              {topContributors.map((user, index) => (
                <div
                  key={user.name}
                  className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-accent"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-xs font-bold text-white">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {user.posts} posts • {user.helpful} helpful
                    </p>
                  </div>
                  <button className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90">
                    Follow
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Community Guidelines */}
          <div className="rounded-lg border bg-card p-6">
            <h3 className="mb-4 font-semibold">Community Guidelines</h3>
            <ul className="space-y-2 text-xs text-muted-foreground">
              <li>✅ Be respectful and supportive</li>
              <li>✅ Share helpful tips and experiences</li>
              <li>✅ Ask questions and help others</li>
              <li>❌ No spam or self-promotion</li>
              <li>❌ No offensive language</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
