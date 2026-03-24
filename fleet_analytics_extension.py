import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import matplotlib.pyplot as plt
import seaborn as sns

class FleetAnalytics:
    """
    Phần mở rộng Phân tích Dữ liệu mạnh mẽ cho Hệ thống Quản lý Đội Xe
    Sử dụng Python (Pandas/Seaborn) để cung cấp các thấu hiểu sâu sắc (Insights).
    """
    
    def __init__(self, fuel_df=None, tasks_df=None, expenses_df=None):
        self.fuel_df = fuel_df
        self.tasks_df = tasks_df
        self.expenses_df = expenses_df
        # Thiết lập style thẩm mỹ
        sns.set_theme(style="whitegrid")
        plt.rcParams['font.sans-serif'] = ['Roboto', 'sans-serif']

    def predict_fuel_consumption(self, vehicle_id):
        """
        Dự báo mức tiêu thụ nhiên liệu dựa trên dữ liệu lịch sử.
        Sử dụng Linear Regression hoặc Moving Average đơn giản.
        """
        if self.fuel_df is None or self.fuel_df.empty:
            return "Thiếu dữ liệu nhiên liệu."
            
        vehicle_data = self.fuel_df[self.fuel_df['vehicle_id'] == vehicle_id].sort_values('date')
        if len(vehicle_data) < 3:
            return "Dữ liệu quá ít để dự báo."
            
        # Giả lập xu hướng
        last_consumption = vehicle_data['consumption'].iloc[-1]
        trend = (vehicle_data['consumption'].iloc[-1] - vehicle_data['consumption'].iloc[0]) / len(vehicle_data)
        
        prediction = last_consumption + trend
        return f"Dự báo tiêu thụ tiếp theo: {prediction:.2f} Lit/100km (Xu hướng: {'Giảm' if trend < 0 else 'Tăng'})"

    def driver_performance_matrix(self):
        """
        Tạo ma trận hiệu suất tài xế tích hợp.
        """
        if self.tasks_df is None or self.tasks_df.empty:
            return "Thiếu dữ liệu nhiệm vụ."
            
        # Nhóm dữ liệu tài xế
        perf = self.tasks_df.groupby('driver_id').agg({
            'id': 'count',
            'status': lambda x: (x == 'completed').sum() / len(x) * 100
        }).rename(columns={'id': 'total_tasks', 'status': 'completion_rate'})
        
        return perf

    def plot_cost_distribution(self, output_path="cost_analysis.png"):
        """
        Tạo biểu đồ phân bổ chi phí chuyên nghiệp.
        """
        if self.expenses_df is None: return
        
        plt.figure(figsize=(10, 6))
        sns.barplot(data=self.expenses_df, x='category', y='amount', palette="viridis")
        plt.title("Phân bổ Chi phí Đội xe theo Hạng mục", fontsize=16)
        plt.xlabel("Hạng mục", fontsize=12)
        plt.ylabel("Số tiền (VND)", fontsize=12)
        plt.tight_layout()
        plt.savefig(output_path)
        print(f"Biểu đồ đã được lưu: {output_path}")

# Hướng dẫn tích hợp:
# Dữ liệu từ Supabase có thể được xuất ra JSON hoặc kết nối trực tiếp qua API
# để nạp vào script này phục vụ báo cáo hàng tháng cho CEO.

if __name__ == "__main__":
    print("--- POWERFUL FLEET ANALYTICS READY ---")
    # Giả lập dữ liệu demo
    demo_expenses = pd.DataFrame({
        'category': ['Xăng', 'Bảo dưỡng', 'Lương', 'Phí cầu đường'],
        'amount': [50000000, 12000000, 150000000, 8000000]
    })
    
    analytics = FleetAnalytics(expenses_df=demo_expenses)
    # analytics.plot_cost_distribution()
