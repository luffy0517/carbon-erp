export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[]

export interface Database {
  public: {
    Tables: {
      _prisma_migrations: {
        Row: {
          id: string
          checksum: string
          finished_at: string | null
          migration_name: string
          logs: string | null
          rolled_back_at: string | null
          started_at: string
          applied_steps_count: number
        }
        Insert: {
          id: string
          checksum: string
          finished_at?: string | null
          migration_name: string
          logs?: string | null
          rolled_back_at?: string | null
          started_at?: string
          applied_steps_count?: number
        }
        Update: {
          id?: string
          checksum?: string
          finished_at?: string | null
          migration_name?: string
          logs?: string | null
          rolled_back_at?: string | null
          started_at?: string
          applied_steps_count?: number
        }
      }
      employee: {
        Row: {
          id: string
          employeeTypeId: string
        }
        Insert: {
          id: string
          employeeTypeId: string
        }
        Update: {
          id?: string
          employeeTypeId?: string
        }
      }
      employeeType: {
        Row: {
          name: string
          updatedAt: string | null
          id: string
          color: string | null
          protected: boolean
          createdAt: string
        }
        Insert: {
          name: string
          updatedAt?: string | null
          id?: string
          color?: string | null
          protected?: boolean
          createdAt?: string
        }
        Update: {
          name?: string
          updatedAt?: string | null
          id?: string
          color?: string | null
          protected?: boolean
          createdAt?: string
        }
      }
      employeeTypePermission: {
        Row: {
          employeeTypeId: string
          featureId: string
          updatedAt: string | null
          create: boolean
          delete: boolean
          update: boolean
          view: boolean
          createdAt: string
        }
        Insert: {
          employeeTypeId: string
          featureId: string
          updatedAt?: string | null
          create?: boolean
          delete?: boolean
          update?: boolean
          view?: boolean
          createdAt?: string
        }
        Update: {
          employeeTypeId?: string
          featureId?: string
          updatedAt?: string | null
          create?: boolean
          delete?: boolean
          update?: boolean
          view?: boolean
          createdAt?: string
        }
      }
      feature: {
        Row: {
          name: string
          updatedAt: string | null
          id: string
          createdAt: string
        }
        Insert: {
          name: string
          updatedAt?: string | null
          id?: string
          createdAt?: string
        }
        Update: {
          name?: string
          updatedAt?: string | null
          id?: string
          createdAt?: string
        }
      }
      group: {
        Row: {
          name: string
          updatedAt: string | null
          id: string
          isIdentityGroup: boolean
          isEmployeeTypeGroup: boolean
          createdAt: string
        }
        Insert: {
          name: string
          updatedAt?: string | null
          id?: string
          isIdentityGroup?: boolean
          isEmployeeTypeGroup?: boolean
          createdAt?: string
        }
        Update: {
          name?: string
          updatedAt?: string | null
          id?: string
          isIdentityGroup?: boolean
          isEmployeeTypeGroup?: boolean
          createdAt?: string
        }
      }
      membership: {
        Row: {
          groupId: string
          memberGroupId: string | null
          memberUserId: string | null
          id: number
        }
        Insert: {
          groupId: string
          memberGroupId?: string | null
          memberUserId?: string | null
          id?: number
        }
        Update: {
          groupId?: string
          memberGroupId?: string | null
          memberUserId?: string | null
          id?: number
        }
      }
      user: {
        Row: {
          id: string
          email: string
          firstName: string
          lastName: string
          emailVerified: string | null
          updatedAt: string | null
          fullName: string | null
          createdAt: string
        }
        Insert: {
          id: string
          email: string
          firstName: string
          lastName: string
          emailVerified?: string | null
          updatedAt?: string | null
          fullName?: string | null
          createdAt?: string
        }
        Update: {
          id?: string
          email?: string
          firstName?: string
          lastName?: string
          emailVerified?: string | null
          updatedAt?: string | null
          fullName?: string | null
          createdAt?: string
        }
      }
    }
    Views: {
      group_member: {
        Row: {
          id: number | null
          name: string | null
          isIdentityGroup: boolean | null
          isEmployeeTypeGroup: boolean | null
          groupId: string | null
          memberGroupId: string | null
          memberUserId: string | null
          user: Json | null
        }
      }
      groups_recursive: {
        Row: {
          groupId: string | null
          name: string | null
          parentId: string | null
          isIdentityGroup: boolean | null
          isEmployeeTypeGroup: boolean | null
          user: Json | null
        }
      }
      groups_view: {
        Row: {
          id: string | null
          isEmployeeTypeGroup: boolean | null
          name: string | null
          parentId: string | null
          users: Json | null
        }
      }
    }
    Functions: {
      delete_claim: {
        Args: { uid: string; claim: string }
        Returns: string
      }
      get_claim: {
        Args: { uid: string; claim: string }
        Returns: Json
      }
      get_claims: {
        Args: { uid: string }
        Returns: Json
      }
      get_my_claim: {
        Args: { claim: string }
        Returns: Json
      }
      get_my_claims: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      groups_for_user: {
        Args: { uid: string }
        Returns: Json
      }
      is_claims_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      set_claim: {
        Args: { uid: string; claim: string; value: Json }
        Returns: string
      }
      users_for_groups: {
        Args: { groups: string[] }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}

