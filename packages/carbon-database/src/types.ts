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
      address: {
        Row: {
          addressLine1: string | null
          addressLine2: string | null
          city: string | null
          state: string | null
          postalCode: string | null
          countryId: number | null
          phone: string | null
          fax: string | null
          id: number
        }
        Insert: {
          addressLine1?: string | null
          addressLine2?: string | null
          city?: string | null
          state?: string | null
          postalCode?: string | null
          countryId?: number | null
          phone?: string | null
          fax?: string | null
          id?: number
        }
        Update: {
          addressLine1?: string | null
          addressLine2?: string | null
          city?: string | null
          state?: string | null
          postalCode?: string | null
          countryId?: number | null
          phone?: string | null
          fax?: string | null
          id?: number
        }
      }
      attributeDataType: {
        Row: {
          label: string
          id: number
          isBoolean: boolean
          isDate: boolean
          isList: boolean
          isNumeric: boolean
          isText: boolean
          isUser: boolean
        }
        Insert: {
          label: string
          id?: number
          isBoolean?: boolean
          isDate?: boolean
          isList?: boolean
          isNumeric?: boolean
          isText?: boolean
          isUser?: boolean
        }
        Update: {
          label?: string
          id?: number
          isBoolean?: boolean
          isDate?: boolean
          isList?: boolean
          isNumeric?: boolean
          isText?: boolean
          isUser?: boolean
        }
      }
      contact: {
        Row: {
          firstName: string
          lastName: string
          email: string
          title: string | null
          mobilePhone: string | null
          homePhone: string | null
          workPhone: string | null
          fax: string | null
          addressLine1: string | null
          addressLine2: string | null
          city: string | null
          state: string | null
          postalCode: string | null
          countryId: number | null
          birthday: string | null
          notes: string | null
          id: string
        }
        Insert: {
          firstName: string
          lastName: string
          email: string
          title?: string | null
          mobilePhone?: string | null
          homePhone?: string | null
          workPhone?: string | null
          fax?: string | null
          addressLine1?: string | null
          addressLine2?: string | null
          city?: string | null
          state?: string | null
          postalCode?: string | null
          countryId?: number | null
          birthday?: string | null
          notes?: string | null
          id?: string
        }
        Update: {
          firstName?: string
          lastName?: string
          email?: string
          title?: string | null
          mobilePhone?: string | null
          homePhone?: string | null
          workPhone?: string | null
          fax?: string | null
          addressLine1?: string | null
          addressLine2?: string | null
          city?: string | null
          state?: string | null
          postalCode?: string | null
          countryId?: number | null
          birthday?: string | null
          notes?: string | null
          id?: string
        }
      }
      country: {
        Row: {
          name: string
          code: string
          id: number
        }
        Insert: {
          name: string
          code: string
          id?: number
        }
        Update: {
          name?: string
          code?: string
          id?: number
        }
      }
      customer: {
        Row: {
          name: string
          description: string | null
          customerTypeId: string | null
          customerStatusId: number | null
          taxId: string | null
          accountManagerId: string | null
          logo: string | null
          createdBy: string | null
          updatedAt: string | null
          updatedBy: string | null
          id: string
          createdAt: string
        }
        Insert: {
          name: string
          description?: string | null
          customerTypeId?: string | null
          customerStatusId?: number | null
          taxId?: string | null
          accountManagerId?: string | null
          logo?: string | null
          createdBy?: string | null
          updatedAt?: string | null
          updatedBy?: string | null
          id?: string
          createdAt?: string
        }
        Update: {
          name?: string
          description?: string | null
          customerTypeId?: string | null
          customerStatusId?: number | null
          taxId?: string | null
          accountManagerId?: string | null
          logo?: string | null
          createdBy?: string | null
          updatedAt?: string | null
          updatedBy?: string | null
          id?: string
          createdAt?: string
        }
      }
      customerAccount: {
        Row: {
          id: string
          customerId: string
        }
        Insert: {
          id: string
          customerId: string
        }
        Update: {
          id?: string
          customerId?: string
        }
      }
      customerContact: {
        Row: {
          customerId: string
          contactId: string
          customerLocationId: number | null
          userId: string | null
          id: string
        }
        Insert: {
          customerId: string
          contactId: string
          customerLocationId?: number | null
          userId?: string | null
          id?: string
        }
        Update: {
          customerId?: string
          contactId?: string
          customerLocationId?: number | null
          userId?: string | null
          id?: string
        }
      }
      customerLocation: {
        Row: {
          customerId: string
          addressId: number
          id: number
        }
        Insert: {
          customerId: string
          addressId: number
          id?: number
        }
        Update: {
          customerId?: string
          addressId?: number
          id?: number
        }
      }
      customerStatus: {
        Row: {
          name: string
          updatedAt: string | null
          id: number
          createdAt: string
        }
        Insert: {
          name: string
          updatedAt?: string | null
          id?: number
          createdAt?: string
        }
        Update: {
          name?: string
          updatedAt?: string | null
          id?: number
          createdAt?: string
        }
      }
      customerType: {
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
          isCustomerOrgGroup: boolean
          isCustomerTypeGroup: boolean
          isSupplierTypeGroup: boolean
          isSupplierOrgGroup: boolean
          createdAt: string
        }
        Insert: {
          name: string
          updatedAt?: string | null
          id?: string
          isIdentityGroup?: boolean
          isEmployeeTypeGroup?: boolean
          isCustomerOrgGroup?: boolean
          isCustomerTypeGroup?: boolean
          isSupplierTypeGroup?: boolean
          isSupplierOrgGroup?: boolean
          createdAt?: string
        }
        Update: {
          name?: string
          updatedAt?: string | null
          id?: string
          isIdentityGroup?: boolean
          isEmployeeTypeGroup?: boolean
          isCustomerOrgGroup?: boolean
          isCustomerTypeGroup?: boolean
          isSupplierTypeGroup?: boolean
          isSupplierOrgGroup?: boolean
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
      supplier: {
        Row: {
          name: string
          description: string | null
          supplierTypeId: string | null
          supplierStatusId: number | null
          taxId: string | null
          accountManagerId: string | null
          logo: string | null
          createdBy: string | null
          updatedAt: string | null
          updatedBy: string | null
          id: string
          createdAt: string
        }
        Insert: {
          name: string
          description?: string | null
          supplierTypeId?: string | null
          supplierStatusId?: number | null
          taxId?: string | null
          accountManagerId?: string | null
          logo?: string | null
          createdBy?: string | null
          updatedAt?: string | null
          updatedBy?: string | null
          id?: string
          createdAt?: string
        }
        Update: {
          name?: string
          description?: string | null
          supplierTypeId?: string | null
          supplierStatusId?: number | null
          taxId?: string | null
          accountManagerId?: string | null
          logo?: string | null
          createdBy?: string | null
          updatedAt?: string | null
          updatedBy?: string | null
          id?: string
          createdAt?: string
        }
      }
      supplierAccount: {
        Row: {
          id: string
          supplierId: string
        }
        Insert: {
          id: string
          supplierId: string
        }
        Update: {
          id?: string
          supplierId?: string
        }
      }
      supplierContact: {
        Row: {
          supplierId: string
          contactId: string
          supplierLocationId: number | null
          userId: string | null
          id: string
        }
        Insert: {
          supplierId: string
          contactId: string
          supplierLocationId?: number | null
          userId?: string | null
          id?: string
        }
        Update: {
          supplierId?: string
          contactId?: string
          supplierLocationId?: number | null
          userId?: string | null
          id?: string
        }
      }
      supplierLocation: {
        Row: {
          supplierId: string
          addressId: number
          id: number
        }
        Insert: {
          supplierId: string
          addressId: number
          id?: number
        }
        Update: {
          supplierId?: string
          addressId?: number
          id?: number
        }
      }
      supplierStatus: {
        Row: {
          name: string
          updatedAt: string | null
          id: number
          createdAt: string
        }
        Insert: {
          name: string
          updatedAt?: string | null
          id?: number
          createdAt?: string
        }
        Update: {
          name?: string
          updatedAt?: string | null
          id?: number
          createdAt?: string
        }
      }
      supplierType: {
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
      user: {
        Row: {
          id: string
          email: string
          firstName: string
          lastName: string
          avatarUrl: string | null
          emailVerified: string | null
          updatedAt: string | null
          fullName: string | null
          about: string
          active: boolean | null
          createdAt: string
        }
        Insert: {
          id: string
          email: string
          firstName: string
          lastName: string
          avatarUrl?: string | null
          emailVerified?: string | null
          updatedAt?: string | null
          fullName?: string | null
          about?: string
          active?: boolean | null
          createdAt?: string
        }
        Update: {
          id?: string
          email?: string
          firstName?: string
          lastName?: string
          avatarUrl?: string | null
          emailVerified?: string | null
          updatedAt?: string | null
          fullName?: string | null
          about?: string
          active?: boolean | null
          createdAt?: string
        }
      }
      userAttribute: {
        Row: {
          name: string
          userAttributeCategoryId: number
          attributeDataTypeId: number
          listOptions: string[] | null
          createdBy: string
          updatedAt: string | null
          updatedBy: string | null
          id: number
          sortOrder: number
          canSelfManage: boolean | null
          active: boolean | null
          createdAt: string
        }
        Insert: {
          name: string
          userAttributeCategoryId: number
          attributeDataTypeId: number
          listOptions?: string[] | null
          createdBy: string
          updatedAt?: string | null
          updatedBy?: string | null
          id?: number
          sortOrder?: number
          canSelfManage?: boolean | null
          active?: boolean | null
          createdAt?: string
        }
        Update: {
          name?: string
          userAttributeCategoryId?: number
          attributeDataTypeId?: number
          listOptions?: string[] | null
          createdBy?: string
          updatedAt?: string | null
          updatedBy?: string | null
          id?: number
          sortOrder?: number
          canSelfManage?: boolean | null
          active?: boolean | null
          createdAt?: string
        }
      }
      userAttributeCategory: {
        Row: {
          name: string
          createdBy: string
          updatedAt: string | null
          updatedBy: string | null
          id: number
          public: boolean | null
          protected: boolean | null
          active: boolean | null
          createdAt: string
        }
        Insert: {
          name: string
          createdBy: string
          updatedAt?: string | null
          updatedBy?: string | null
          id?: number
          public?: boolean | null
          protected?: boolean | null
          active?: boolean | null
          createdAt?: string
        }
        Update: {
          name?: string
          createdBy?: string
          updatedAt?: string | null
          updatedBy?: string | null
          id?: number
          public?: boolean | null
          protected?: boolean | null
          active?: boolean | null
          createdAt?: string
        }
      }
      userAttributeValue: {
        Row: {
          userAttributeId: number
          userId: string
          valueBoolean: boolean | null
          valueDate: string | null
          valueNumeric: number | null
          valueText: string | null
          valueUser: string | null
          createdBy: string
          updatedAt: string | null
          updatedBy: string | null
          id: number
          createdAt: string
        }
        Insert: {
          userAttributeId: number
          userId: string
          valueBoolean?: boolean | null
          valueDate?: string | null
          valueNumeric?: number | null
          valueText?: string | null
          valueUser?: string | null
          createdBy: string
          updatedAt?: string | null
          updatedBy?: string | null
          id?: number
          createdAt?: string
        }
        Update: {
          userAttributeId?: number
          userId?: string
          valueBoolean?: boolean | null
          valueDate?: string | null
          valueNumeric?: number | null
          valueText?: string | null
          valueUser?: string | null
          createdBy?: string
          updatedAt?: string | null
          updatedBy?: string | null
          id?: number
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
          isCustomerOrgGroup: boolean | null
          isCustomerTypeGroup: boolean | null
          isSupplierOrgGroup: boolean | null
          isSupplierTypeGroup: boolean | null
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
          isCustomerOrgGroup: boolean | null
          isCustomerTypeGroup: boolean | null
          isSupplierOrgGroup: boolean | null
          isSupplierTypeGroup: boolean | null
          user: Json | null
        }
      }
      groups_view: {
        Row: {
          id: string | null
          isEmployeeTypeGroup: boolean | null
          isCustomerOrgGroup: boolean | null
          isCustomerTypeGroup: boolean | null
          isSupplierOrgGroup: boolean | null
          isSupplierTypeGroup: boolean | null
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
      groups_query: {
        Args: { _name: string; _uid: string }
        Returns: {
          id: string
          name: string
          parentId: string
          isEmployeeTypeGroup: boolean
          isCustomerOrgGroup: boolean
          isCustomerTypeGroup: boolean
          isSupplierOrgGroup: boolean
          isSupplierTypeGroup: boolean
          users: Json
        }[]
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

