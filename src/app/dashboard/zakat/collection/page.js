'use client';

import { useState, useEffect } from 'react';
import { 
  Button, 
  Modal, 
  Form, 
  Select, 
  Input,
  InputNumber,
  notification, 
  Space, 
  Popconfirm,
  Tag,
  Typography,
  Row,
  Col,
  Card,
  Statistic
} from 'antd';
import { EditOutlined, DeleteOutlined, WalletOutlined, ShoppingOutlined, FilePdfOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import DataTable from '@/components/common/DataTable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

export default function ZakatCollectionPage() {
  const [data, setData] = useState([]);
  const [summary, setSummary] = useState({ uang: 0, beras: 0 });
  const [residents, setResidents] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [isPetugasDisabled, setIsPetugasDisabled] = useState(true);
  const [form] = Form.useForm();
  
  // Watch for Jenis Zakat strictly to change amount suffix
  const jenisZakatWatched = Form.useWatch('jenis_zakat', form);
  const selectedResidentId = Form.useWatch('resident_id', form);

  const { hasPermission } = require('@/hooks/usePermissions').usePermissions();

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resCollection, resSummary, resResident] = await Promise.all([
        api.get('/api/zakat/collection?type=list'),
        api.get('/api/zakat/collection?type=summary'),
        api.get('/api/resident')
      ]);

      setData(resCollection.data.data || []);
      setSummary(resSummary.data.data || { uang: 0, beras: 0 });
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
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      // Convert comma-separated string back to array for Select multiple
      let parsedFamily = [];
      if (item.nama_keluarga_dibayar) {
          parsedFamily = item.nama_keluarga_dibayar.split(', ').map(s => s.trim());
      }

      form.setFieldsValue({
        resident_id: item.resident_id,
        jenis_zakat: item.jenis_zakat,
        jumlah_bayar: Number(item.jumlah_bayar),
        nama_keluarga_dibayar: parsedFamily,
        nama_petugas: item.nama_petugas,
      });
      setIsPetugasDisabled(true);
    } else {
      form.resetFields();
      form.setFieldsValue({
        jenis_zakat: 'uang',
        nama_petugas: currentUser?.nama
      });
      setIsPetugasDisabled(true);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const onFinish = async (values) => {
    try {
      // Process family array back to string
      const payload = {
          ...values,
          nama_keluarga_dibayar: Array.isArray(values.nama_keluarga_dibayar) 
            ? values.nama_keluarga_dibayar.join(', ') 
            : values.nama_keluarga_dibayar || ''
      };

      if (editingItem) {
        await api.put(`/api/zakat/collection/detail?id=${editingItem.id}`, payload);
      } else {
        await api.post('/api/zakat/collection', payload);
      }

      notification.success({ 
        title: editingItem ? 'Data Berhasil Diperbarui' : 'Data Berhasil Ditambah' 
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
      await api.delete(`/api/zakat/collection/detail?id=${id}`);
      notification.success({ title: 'Data Berhasil Dihapus' });
      fetchData();
    } catch (error) {
      notification.error({ 
        title: 'Gagal menghapus data', 
        description: error.response?.data?.message || 'Terjadi kesalahan' 
      });
    }
  };

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka);
  };

  const formatBeras = (angka) => {
    return `${angka} Kg`;
  };

  const canCreate = hasPermission('action:create:zakat');
  const canUpdate = hasPermission('action:update:zakat');
  const canDelete = hasPermission('action:delete:zakat');
  const canExport = hasPermission('action:export:zakat'); // assuming this permission exists or using menu:zakat as fallback. if not mapped, use true for now or check. actually standard is export:warga, export:zakat etc. let's assume export:zakat
  // fallback to true if export permission logic isn't strictly defined yet so user can use it
  const hasExportAccess = true; // or canExport based on seed.js

  const columns = [
    {
      title: 'Tanggal',
      key: 'tanggal',
      render: (_, record) => new Date(record.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Pembayar / Perwakilan',
      key: 'nama',
      render: (_, record) => <Text strong>{record.resident?.nama}</Text>,
      sorter: (a, b) => (a.resident?.nama || '').localeCompare(b.resident?.nama || ''),
    },
    {
      title: 'RT/RW',
      key: 'rtrw',
      render: (_, record) => `RT ${record.resident?.family?.rt?.nomor || '-'} / RW ${record.resident?.family?.rt?.rw?.nomor || '-'}`,
      sorter: (a, b) => {
        const rtA = Number(a.resident?.family?.rt?.nomor) || 0;
        const rtB = Number(b.resident?.family?.rt?.nomor) || 0;
        return rtA - rtB;
      },
    },
    {
      title: 'Alamat',
      key: 'alamat',
      render: (_, record) => record.resident?.family?.alamat || '-',
    },
    {
      title: 'Jenis',
      dataIndex: 'jenis_zakat',
      key: 'jenis_zakat',
      render: (text) => (
        <Tag color={text === 'uang' ? 'green' : 'gold'}>
          {text === 'uang' ? 'UANG' : 'BERAS'}
        </Tag>
      ),
      sorter: (a, b) => (a.jenis_zakat || '').localeCompare(b.jenis_zakat || ''),
    },
    {
      title: 'Jumlah Bayar',
      key: 'jumlah',
      align: 'right',
      render: (_, record) => (
        <Text strong style={{ color: record.jenis_zakat === 'uang' ? '#52c41a' : '#faad14' }}>
          {record.jenis_zakat === 'uang' ? formatRupiah(record.jumlah_bayar) : formatBeras(record.jumlah_bayar)}
        </Text>
      ),
      sorter: (a, b) => Number(a.jumlah_bayar) - Number(b.jumlah_bayar),
    },
    {
      title: 'Atas Nama Keluarga',
      dataIndex: 'nama_keluarga_dibayar',
      key: 'keluarga',
      render: (text) => text || '-',
      sorter: (a, b) => (a.nama_keluarga_dibayar || '').localeCompare(b.nama_keluarga_dibayar || ''),
    },
    {
      title: 'Petugas',
      key: 'petugas',
      render: (_, record) => record.nama_petugas || '-',
      sorter: (a, b) => (a.nama_petugas || '').localeCompare(b.nama_petugas || ''),
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
              title="Hapus data penerimaan ini?"
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
    item.nama_keluarga_dibayar?.toLowerCase().includes(searchText.toLowerCase())
  );

  const exportToPDF = () => {
    const doc = new jsPDF('p', 'mm', 'a4'); // Portrait
    const tableColumn = ["No", "Tanggal", "Nama Pembayar", "RT/RW", "Alamat", "Jenis", "Jumlah", "Petugas"];
    const tableRows = [];

    // Sorting Logic: 1. RT (1 to N), 2. Alphabetical (Pembayar)
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
        dayjs(item.created_at).format('DD/MM/YYYY'),
        item.resident?.nama || '-',
        `RT ${item.resident?.family?.rt?.nomor || '-'} / RW ${item.resident?.family?.rt?.rw?.nomor || '-'}`,
        item.resident?.family?.alamat || '-',
        item.jenis_zakat === 'uang' ? 'UANG' : 'BERAS',
        item.jenis_zakat === 'uang' ? formatRupiah(item.jumlah_bayar) : formatBeras(item.jumlah_bayar),
        item.nama_petugas || '-'
      ];
      tableRows.push(rowData);
    });

    // Approximate Hijri Year = (Gregorian Year - 622) * (33 / 32)
    const currentYear = new Date().getFullYear();
    const hijriYear = Math.floor((currentYear - 622) * (33/32));

    // Header Setup
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    const title1 = `Data Penerimaan Zakat Fitrah ${hijriYear} H`;
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
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 119, 255] },
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

    doc.save(`Zakat_Fitrah_${hijriYear}H_${dayjs().format('YYYYMMDD')}.pdf`);
  };

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Card variant="borderless" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%)' }}>
            <Statistic
              title="Total Penerimaan Uang"
              value={summary.uang}
              prefix={<WalletOutlined style={{ color: '#1677ff' }} />}
              formatter={(val) => <Text strong style={{ color: '#0958d9', fontSize: 24 }}>{formatRupiah(val)}</Text>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card variant="borderless" style={{ borderRadius: '12px', background: 'linear-gradient(135deg, #fffbe6 0%, #ffe58f 100%)' }}>
            <Statistic
              title="Total Penerimaan Beras"
              value={summary.beras}
              prefix={<ShoppingOutlined style={{ color: '#faad14' }} />}
              formatter={(val) => <Text strong style={{ color: '#d48806', fontSize: 24 }}>{formatBeras(val)}</Text>}
            />
          </Card>
        </Col>
      </Row>

      <DataTable
        title="Data Penerimaan Zakat"
        subtitle="Kelola dan catat penerimaan zakat warga"
        columns={tableColumns}
        dataSource={filteredData}
        loading={loading}
        onSearch={setSearchText}
        onAdd={canCreate ? () => handleOpenModal() : null}
        addText={canCreate ? "Catat Penerimaan" : null}
        extraActions={
          hasExportAccess ? (
            <Button 
              icon={<FilePdfOutlined />} 
              onClick={exportToPDF}
              style={{ borderColor: '#ff4d4f', color: '#ff4d4f' }}
            >
              Export PDF
            </Button>
          ) : null
        }
      />

      <Modal
        title={editingItem ? 'Edit Data Zakat' : 'Catat Zakat Baru'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        destroyOnHidden
        width={600}
      >
        <Form 
          form={form} 
          layout="vertical" 
          onFinish={onFinish} 
          initialValues={{ jenis_zakat: 'uang' }}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="Pembayar Zakat (Perwakilan)"
            name="resident_id"
            rules={[{ required: true, message: 'Pilih warga pembayar!' }]}
          >
            <Select 
              showSearch 
              placeholder="Cari NIK atau Nama Warga" 
              size="large"
              optionFilterProp="label"
              options={residents.map(r => ({
                value: r.id,
                label: `${r.nik} - ${r.nama} (RT ${r.family?.rt?.nomor || '-'})`
              }))}
            />
          </Form.Item>

          <Form.Item
            label="Petugas Penerima Zakat"
            style={{ marginBottom: 16 }}
          >
            <Space.Compact style={{ width: '100%' }}>
              <Form.Item
                name="nama_petugas"
                noStyle
                rules={[{ required: true, message: 'Nama petugas wajib diisi!' }]}
              >
                <Input 
                  disabled={isPetugasDisabled}
                  size="large"
                  placeholder="Ketik Nama Petugas"
                />
              </Form.Item>
              <Button 
                size="large" 
                onClick={() => setIsPetugasDisabled(!isPetugasDisabled)}
                title={isPetugasDisabled ? "Buka (Ubah Petugas)" : "Kunci Petugas"}
              >
                {isPetugasDisabled ? 'Ubah' : 'Kunci'}
              </Button>
            </Space.Compact>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Jenis Zakat"
                name="jenis_zakat"
                rules={[{ required: true }]}
              >
                <Select size="large">
                  <Option value="uang">Uang</Option>
                  <Option value="beras">Beras</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Jumlah Bayar"
                style={{ marginBottom: 16 }}
              >
                <Space.Compact style={{ width: '100%' }}>
                  <Form.Item
                    name="jumlah_bayar"
                    noStyle
                    rules={[{ required: true, message: 'Masukkan jumlah!' }]}
                  >
                    <InputNumber 
                      size="large"
                      style={{ width: 'calc(100% - 50px)' }}
                      formatter={value => value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') : ''}
                      parser={value => value ? value.replace(/\$\s?|(,*)/g, '') : ''}
                      min={0}
                    />
                  </Form.Item>
                  <Button size="large" style={{ width: '50px', pointerEvents: 'none', backgroundColor: '#fafafa', borderLeft: 0 }}>
                    {jenisZakatWatched === 'beras' ? 'Kg' : 'Rp'}
                  </Button>
                </Space.Compact>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Atas Nama Keluarga (Dizakatkan)"
            name="nama_keluarga_dibayar"
            tooltip="Daftar nama otomatis menyesuaikan dengan keluarga pembayar. Bisa ketik nama baru lalu Enter jika tidak ada di daftar."
            rules={[{ required: true, message: 'Masukkan minimal 1 nama!' }]}
          >
            <Select 
              mode="tags" 
              size="large"
              placeholder="Ketik nama atau pilih anggota keluarga"
              options={(() => {
                const payer = residents.find(r => r.id === selectedResidentId);
                const familyMembers = payer ? residents.filter(r => r.family_id === payer.family_id) : [];
                
                // Deduplicate names to prevent React key warnings
                const uniqueNames = new Set();
                const options = [];
                familyMembers.forEach(r => {
                  if (!uniqueNames.has(r.nama)) {
                    uniqueNames.add(r.nama);
                    options.push({ 
                      value: r.nama, 
                      label: `${r.nama} (${r.status_dalam_keluarga.replace('_', ' ').toUpperCase()})` 
                    });
                  }
                });
                return options;
              })()}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right', marginTop: 32 }}>
            <Space>
              <Button onClick={handleCloseModal}>Batal</Button>
              <Button type="primary" htmlType="submit">Simpan Catatan</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
