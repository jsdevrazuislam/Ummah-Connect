interface UserResponse {
  statusCode: number;
  data: Data;
  message: string;
  success: boolean;
}
interface ProfileUser{
  data: User
}
interface UpdateUserResponse {
  statusCode: number;
  data: User;
  message: string;
  success: boolean;
}


interface Data {
  user: User;
  access_token: string;
  refresh_token: string;
}
interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  avatar?: null;
  location?: null;
  website?: null;
  role: string;
  title?: null;
  refresh_token: string;
  is_verified: boolean;
  createdAt: string;
  updatedAt: string;
  bio:string
  gender:string
  cover:string
  followers_count:number
  following_count:number
  is_two_factor_enabled:boolean
  privacy_settings: PrivacySettings
  notification_preferences: NotificationPreference
  is_saved_backup_codes:boolean
  isFollowing: boolean
  status?: string
}

interface JwtResponsePayload {
  id: number;
  email: string;
  iat: number;
  exp: number;
  role: 'user' | 'admin' | 'super-admin';
}

interface NotificationPreference{
    push_notification: boolean;
    email_notification: boolean;
    prayer_time_notification: boolean;
    like_post: boolean;
    comment_post: boolean;
    mention: boolean;
    new_follower: boolean;
    dm: boolean;
    islamic_event: boolean;
}

interface PrivacySettings {
  message: string;
  post_see: string;
  active_status: boolean;
  read_receipts: boolean;
  location_share: boolean;
  private_account: boolean;
}
