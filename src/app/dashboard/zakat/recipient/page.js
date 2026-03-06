'use client';

import { useState, useEffect } from 'react';
import { 
  Button, 
  Modal, 
  Form, 
  Select, 
  notification, 
  Space, 
  Popconfirm,
  Tag,
  Typography
} from 'antd';
import { EditOutlined, DeleteOutlined, FilePdfOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import DataTable from '@/components/common/DataTable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

export default function ZakatRecipientPage() {
  const [data, setData] = useState([]);
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const { hasPermission } = require('@/hooks/usePermissions').usePermissions();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resRecipient, resResident] = await Promise.all([
        api.get('/api/zakat/recipient'),
        api.get('/api/resident'),
      ]);

      setData(resRecipient.data.data || []);
      setResidents(resResident.data.data || []);
    } catch (error) {
      notification.error({ 
        title: 'Error', 
        description: error.response?.data?.message || 'Gagal memuat data' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({
        resident_id: item.resident_id,
        kategori: item.kategori,
      });
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const onFinish = async (values) => {
    try {
      if (editingItem) {
        await api.put(`/api/zakat/recipient/detail?id=${editingItem.id}`, values);
      } else {
        await api.post('/api/zakat/recipient', values);
      }

      notification.success({ 
        title: editingItem ? 'Data Penerima Berhasil Diperbarui' : 'Penerima Zakat Berhasil Ditambah' 
      });
      handleCloseModal();
      fetchData();
    } catch (error) {
      notification.error({ 
        title: 'Gagal menyimpan data', 
        description: error.response?.data?.message || 'Terjadi kesalahan' 
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/zakat/recipient/detail?id=${id}`);
      notification.success({ title: 'Data Penerima Berhasil Dihapus' });
      fetchData();
    } catch (error) {
      notification.error({ 
        title: 'Gagal menghapus data', 
        description: error.response?.data?.message || 'Terjadi kesalahan' 
      });
    }
  };

  const canCreate = hasPermission('action:create:zakat');
  const canUpdate = hasPermission('action:update:zakat');
  const canDelete = hasPermission('action:delete:zakat');

  const columns = [
    {
      title: 'Nama Penerima',
      key: 'nama',
      render: (_, record) => <Text strong>{record.resident?.nama}</Text>,
      sorter: (a, b) => (a.resident?.nama || '').localeCompare(b.resident?.nama || ''),
    },
    {
      title: 'NIK',
      key: 'nik',
      render: (_, record) => record.resident?.nik,
    },
    {
      title: 'RT',
      key: 'rt',
      render: (_, record) => record.resident?.family?.rt?.nomor || '-',
    },
    {
      title: 'RW',
      key: 'rw',
      render: (_, record) => record.resident?.family?.rt?.rw?.nomor || '-',
    },
    {
      title: 'Kategori',
      dataIndex: 'kategori',
      key: 'kategori',
      render: (text) => <Tag color="blue">{text.toUpperCase()}</Tag>,
    },
    {
      title: 'Alamat Lengkap',
      key: 'alamat',
      render: (_, record) => record.resident?.family?.alamat || '-',
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      width: 100,
      render: (_, record) => (
        <Space size="small">
          {canUpdate && (
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: '#1677ff' }} />} 
              onClick={() => handleOpenModal(record)}
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Hapus penerima ini?"
              onConfirm={() => handleDelete(record.id)}
              okText="Ya"
              cancelText="Tidak"
              okButtonProps={{ danger: true }}
            >
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const tableColumns = (canUpdate || canDelete) ? columns : columns.filter(col => col.key !== 'action');

  const filteredData = data.filter(item => 
    item.resident?.nama?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.resident?.nik?.toLowerCase().includes(searchText.toLowerCase()) ||
    item.kategori.toLowerCase().includes(searchText.toLowerCase())
  );

  const exportToPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4'); // Portrait
    const tableColumn = ["No", "Nama Penerima", "NIK", "RT/RW", "Alamat", "Kategori"];
    const tableRows = [];

    // Sorting Logic: 1. RT (1 to N), 2. Alphabetical (Nama)
    const dataToExport = [...filteredData].sort((a, b) => {
      const rtA = a.resident?.family?.rt?.nomor || Number.MAX_SAFE_INTEGER;
      const rtB = b.resident?.family?.rt?.nomor || Number.MAX_SAFE_INTEGER;
      
      if (rtA !== rtB) {
        return rtA - rtB;
      }
      
      const namaA = a.resident?.nama || '';
      const namaB = b.resident?.nama || '';
      return namaA.localeCompare(namaB);
    });

    dataToExport.forEach((item, index) => {
      const rowData = [
        index + 1,
        item.resident?.nama || '-',
        item.resident?.nik || '-',
        `RT ${item.resident?.family?.rt?.nomor || '-'} / RW ${item.resident?.family?.rt?.rw?.nomor || '-'}`,
        item.resident?.family?.alamat || '-',
        item.kategori.toUpperCase()
      ];
      tableRows.push(rowData);
    });

    // Approximate Hijri Year = (Gregorian Year - 622) * (33 / 32)
    const currentYear = new Date().getFullYear();
    const hijriYear = Math.floor((currentYear - 622) * (33/32));

    // Header Setup
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const title1 = `Data Penerima Zakat Fitrah ${hijriYear} H`;
    const title2 = "Masjid Baitul Mukhlishin";
    doc.setFontSize(12);
    const title3 = "PUP Sektor V Blok O RW 027, Babelan Bekasi Utara";

    // Center alignments
    const pageWidth = doc.internal.pageSize.getWidth();
    doc.setFontSize(14);
    doc.text(title1, pageWidth / 2, 15, { align: 'center' });
    doc.text(title2, pageWidth / 2, 22, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(title3, pageWidth / 2, 28, { align: 'center' });
    
    // Header divider line
    doc.setLineWidth(0.5);
    doc.line(14, 32, pageWidth - 14, 32);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 38,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: false, fontStyle: 'bold', textColor: 0, lineWidth: 0.1, lineColor: 0 },
      margin: { bottom: 40 } // leave space for signatures at bottom of table page
    });

    const finalY = doc.lastAutoTable.finalY + 15;
    
    // Check if we need a new page for signatures
    if (finalY > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      doc.setPage(doc.internal.getNumberOfPages());
    }

    const currentFinalY = doc.lastAutoTable.finalY > doc.internal.pageSize.getHeight() - 40 ? 20 : finalY;

    // Date on the right
    doc.setFontSize(10);
    doc.text(`Bekasi, ${dayjs().format('DD MMMM YYYY')}`, pageWidth - 14, currentFinalY, { align: 'right' });
    
    // Signature block
    doc.text("Ketua DKM,", 30, currentFinalY + 10, { align: 'center' });
    doc.text("Ketua RW 027,", pageWidth - 30, currentFinalY + 10, { align: 'center' });
    
    // Names (giving space for physical signature)
    doc.setFont("helvetica", "bold");
    doc.text("H. Syaifull Abbas", 30, currentFinalY + 30, { align: 'center' });
    doc.text("Kardi", pageWidth - 30, currentFinalY + 30, { align: 'center' });
    doc.setFont("helvetica", "normal");

    // Footer Notes
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(100);
      const footerText = "Penerimaan Zakat dimulai dari tanggal 13 Maret 2026 - 18 Maret 2026";
      doc.text(footerText, 14, doc.internal.pageSize.getHeight() - 10);
    }

    doc.save(`Data_Penerima_Zakat_Fitrah_${hijriYear}H_${dayjs().format('YYYYMMDD')}.pdf`);
  };

  return (
    <div>
      <DataTable
        title="Daftar Penerima Zakat"
        subtitle="Kelola data warga yang berhak menerima zakat"
        columns={tableColumns}
        dataSource={filteredData}
        loading={loading}
        onSearch={setSearchText}
        onAdd={canCreate ? () => handleOpenModal() : null}
        addText={canCreate ? "Tambah Penerima" : null}
        extraActions={
          <Button 
            icon={<FilePdfOutlined />} 
            onClick={exportToPDF}
            style={{ borderColor: '#ff4d4f', color: '#ff4d4f' }}
          >
            Export PDF
          </Button>
        }
      />

      <Modal
        title={editingItem ? 'Edit Penerima Zakat' : 'Tambah Penerima Zakat'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" onFinish={onFinish} style={{ marginTop: 24 }}>
          <Form.Item
            label="Pilih Warga"
            name="resident_id"
            rules={[{ required: true, message: 'Pilih warga!' }]}
          >
            <Select 
              showSearch 
              placeholder="Cari NIK atau Nama Warga" 
              size="large"
              optionFilterProp="label"
              disabled={!!editingItem} // Cannot change resident once created
              options={residents.map(r => ({
                value: r.id,
                label: `${r.nik} - ${r.nama} (RT ${r.family?.rt?.nomor || '-'})`
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Kategori Zakat (Asnaf)"
            name="kategori"
            rules={[{ required: true, message: 'Pilih kategori!' }]}
          >
            <Select size="large">
              <Option value="fakir">Fakir (Sangat miskin, tidak ada harta/tenaga)</Option>
              <Option value="miskin">Miskin (Harta tidak cukup untuk hidup)</Option>
              <Option value="amil">Amil (Panitia/Pengurus Zakat)</Option>
              <Option value="mualaf">Mualaf (Orang yang baru masuk Islam)</Option>
              <Option value="riqab">Riqab (Hamba Sahaya/Korban Perdagangan Manusia)</Option>
              <Option value="gharim">Gharim (Orang yang terlilit hutang untuk kebutuhan halal)</Option>
              <Option value="fisabilillah">Fisabilillah (Pejuang di jalan Allah)</Option>
              <Option value="ibnusabil">Ibnu Sabil (Musafir yang kehabisan bekal)</Option>
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 32 }}>
            <Space>
              <Button onClick={handleCloseModal}>Batal</Button>
              <Button type="primary" htmlType="submit">Simpan</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
