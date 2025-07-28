export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  avatar?: string;
  dateJoined: string;
  lastProfileUpdate: string;
}

export interface Entry {
  id: string;
  title: string;
  synopsis: string;
  content: string;
  isDeleted: boolean;
  dateCreated: string;
  lastUpdated: string;
  userId: string;
}

export interface CreateEntryData {
  title: string;
  synopsis: string;
  content: string;
}

export interface UpdateEntryData {
  title?: string;
  synopsis?: string;
  content?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  username?: string;
  email?: string;
}

export interface UpdatePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
