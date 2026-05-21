export interface AdminStats {
  totalAircraft: number;
  registeredUsers: number;
  openIncidents: number;
  pendingUpdates: number;
}

export interface AdminActivityItem {
  id: string;
  userId: string;
  username: string;
  action: string;
  entityName?: string;
  timeAgo: string;
}

export interface RecentComparisonRow {
  id: string;
  aircraftLabel: string;
  date: string;
  ids: number[];
}

export interface AircraftUpdateDto {
  id: number;
  title: string;
  content: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  aircraftModelId: number;
  aircraftModelName?: string;
  categoryId?: number;
  categoryName?: string;
  authorId?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminUserDto {
  id: string;
  username: string;
  email: string;
  fullName?: string | null;
  active: boolean;
  role: string;
}
