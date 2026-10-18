// ============ UTILITY EKSPOR ============

// Helper untuk ekspor ke CSV
export const exportToCSV = (data, filename = 'laporan.csv') => {
  if (!data || !data.length) return;

  // Ambil semua header
  const headers = Object.keys(data[0]);
  
  // Format baris data
  const csvRows = data.map(row => 
    headers.map(header => {
      let cell = row[header] === null || row[header] === undefined ? '' : row[header];
      // Bungkus string dengan tanda kutip jika mengandung koma
      if (typeof cell === 'string' && cell.includes(',')) {
        cell = `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    }).join(',')
  );

  // Gabungkan header dan baris
  const csvString = [headers.join(','), ...csvRows].join('\n');
  
  // Download file
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Helper untuk format tanggal Indonesia
export const formatTanggal = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric'
  });
};