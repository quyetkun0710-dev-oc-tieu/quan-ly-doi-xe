/**
 * TYPE DEFINITIONS for the Fleet Management Supabase Schema
 * Sử dụng cho các phần mở rộng trên TypeScript/React/Node.js
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          id: number
          table_name: string
          record_id: string
          action: 'INSERT' | 'UPDATE' | 'DELETE'
          old_data: Json | null
          new_data: Json | null
          changed_by: string | null
          changed_at: string
        }
        Insert: {
          id?: number
          table_name: string
          record_id: string
          action: string
          old_data?: Json | null
          new_data?: Json | null
          changed_by?: string | null
          changed_at?: string
        }
      }
      lotrinh: {
        Row: {
          id: number
          ten_lotrinh: string | null
          ma_nv: string | null
          stops: Json | null
          tong_km: number | null
          tong_phut: number | null
          ngay_lap: string | null
          created_at: string
        }
        Insert: {
          id?: number
          ten_lotrinh?: string | null
          ma_nv?: string | null
          stops?: Json | null
          tong_km?: number | null
          tong_phut?: number | null
          ngay_lap?: string | null
          created_at?: string
        }
      }
      fuel: {
        Row: {
          id: number
          vehicle_id: string
          date: string
          liters: number
          cost: number
          odometer: number
          driver_id: string | null
        }
      }
      taixe: {
        Row: {
          id: number
          ma_nv: string
          ho_ten: string
          avatar_url: string | null
          phone: string | null
          role: 'driver' | 'manager' | 'admin'
        }
      }
      xe: {
        Row: {
          id: number
          bien_so: string
          loai_xe: string
          trang_thai: 'active' | 'maintenance' | 'busy'
          last_odometer: number
        }
      }
    }
  }
}
