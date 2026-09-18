export interface CommentsResponse {
  comments: Comment[];
  total: number;
  skip: number;
  limit: number;
}

export interface Comment {
  id: number;
  body: string;
  postId: number;
  likes: number;
  user: CommentUser;
  [key: string]: unknown;
}

export interface CommentUser {
  id: number;
  username: string;
  fullName: string;
  [key: string]: unknown;
}
