export interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: Date | string;
  isRead?: boolean;
}
