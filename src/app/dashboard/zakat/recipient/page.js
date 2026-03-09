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
import { exportDataToPDF } from '@/utils/pdfExport';
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

    exportDataToPDF({
      filename: `Data_Penerima_Zakat_Fitrah_${hijriYear}H_${dayjs().format('YYYYMMDD')}.pdf`,
      orientation: 'p',
      headers: tableColumn,
      data: tableRows,
      customHeader: {
        title1: `Data Penerima Zakat Fitrah ${hijriYear} H`,
        title2: "Masjid Baitul Mukhlishin",
        title3: "PUP Sektor V Blok O RW 027, Babelan Bekasi Utara"
      },
      footerText: "Penerimaan Zakat dimulai dari tanggal 13 Maret 2026 - 18 Maret 2026",
      signatures: [
        { role: "Ketua DKM,", name: "H. Syaifull Abbas", position: "left" },
        { role: "Ketua RW 027,", name: "Kardi", position: "right" }
      ],
      signatureLocation: `Bekasi, ${dayjs().format('DD MMMM YYYY')}`
    });
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
