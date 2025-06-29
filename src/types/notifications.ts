export type Notification = {
  id: string;
  userId: string;
  message: string;
  type: string;
  readStatus: boolean;
  createdAt: Date;
};
