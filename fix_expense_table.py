import re

filepath = r'c:\Users\Admin\Desktop\Test\Quản lý đội xe form\Đã chạy lần 4\tab_baocao_supabase.html'

with open(filepath, encoding='utf-8') as f:
    content = f.read()

insert_code = r"""
    // Expense Table (Chi phí vận hành)
    const eBody = document.getElementById('expenseTableBody');
    const expenseCatLabels = {
      'nhien_lieu': 'Nhiên liệu', 'sua_chua': 'Sửa chữa', 'cau_duong': 'Cầu đường',
      'bai_do_xe': 'Bãi đỗ xe', 'phat': 'Phạt vi phạm', 'bao_duong': 'Bảo dưỡng', 'khac': 'Khác'
    };
    eBody.innerHTML = chiphi.slice(0, 30).map(c => `
        <tr>
          <td>${c.ngay_thuc_hien || '—'}</td>
          <td><strong>${c.bien_so_xe || '—'}</strong></td>
          <td><span class="badge" style="background:rgba(168,85,247,0.15);color:var(--secondary)">${expenseCatLabels[c.loai_chi_phi] || c.loai_chi_phi || '—'}</span></td>
          <td>${c.ho_ten_taixe || c.ma_nv || '—'}</td>
          <td style="font-weight:700; color:var(--secondary)">${(parseFloat(c.so_tien)||0).toLocaleString()} đ</td>
          <td style="font-size:0.8rem;color:var(--text-dim)">${c.ghi_chu || '—'}</td>
        </tr>
    `).join('') || '<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-dim)">Không có dữ liệu chi phí vận hành</td></tr>';

"""

target = '  function exportExcel() {'
content = content.replace(target, insert_code + target, 1)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done!")
