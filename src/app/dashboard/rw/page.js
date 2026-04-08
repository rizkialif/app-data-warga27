'use client';

import { useState, useEffect } from 'react';
import { 
  Button, 
  Modal, 
  Form, 
  Input, 
  notification, 
  Space, 
  Popconfirm,
  Tag,
  Typography
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import DataTable from '@/components/common/DataTable';
import TableActions from '@/components/common/TableActions';

const { Title, Text } = Typography;

export default function RwPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [mounted, setMounted] = useState(false);
  const { hasPermission } = require('@/hooks/usePermissions').usePermissions();

  const fetchRws = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/master-data/rw');
      setData(res.data.data || []);
    } catch (error) {
      notification.error({ 
        message: 'Gagal mengambil data', 
        description: error.response?.data?.message || 'Terjadi kesalahan sistem' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchRws();
  }, []);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({
        nomor: item.nomor,
        nama: item.nama,
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
        await api.put(`/api/master-data/rw/update?id=${editingItem.id}`, values);
      } else {
        await api.post('/api/master-data/rw', values);
      }

      notification.success({ 
        message: editingItem ? 'Data Berhasil Diperbarui' : 'Data Berhasil Ditambah' 
      });
      handleCloseModal();
      fetchRws();
    } catch (error) {
      notification.error({ 
        message: 'Gagal menyimpan data', 
        description: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan' 
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/master-data/rw/delete?id=${id}`);
      notification.success({ message: 'Data Berhasil Dihapus' });
      fetchRws();
    } catch (error) {
      notification.error({ 
        message: 'Gagal menghapus data', 
        description: error.response?.data?.message || 'Terjadi kesalahan saat menghapus' 
      });
    }
  };

  const canCreate = hasPermission('action:create:rw');
  const canUpdate = hasPermission('action:update:rw');
  const canDelete = hasPermission('action:delete:rw');

  const columns = [
    {
      title: 'Nomor RW',
      dataIndex: 'nomor',
      key: 'nomor',
      render: (text) => (
        <Tag color="blue" style={{ fontWeight: 'bold', padding: '4px 12px', borderRadius: '12px' }}>
          RW {String(text).padStart(2, '0')}
        </Tag>
      ),
      sorter: (a, b) => a.nomor - b.nomor,
    },
    {
      title: 'Nama Wilayah',
      dataIndex: 'nama',
      key: 'nama',
      render: (text) => <Text strong>{text || '-'}</Text>,
      sorter: (a, b) => (a.nama || '').localeCompare(b.nama || ''),
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          {canUpdate && (
            <Button 
              type="text" 
              icon={<EditOutlined style={{ color: '#1677ff' }} />} 
              onClick={() => handleOpenModal(record)}
            />
          )}
          {canDelete && (
            <Popconfirm
              title="Hapus data?"
              description="Apakah Anda yakin ingin menghapus RW ini?"
              onConfirm={() => handleDelete(record.id)}
              okText="Ya"
              cancelText="Tidak"
              okButtonProps={{ danger: true }}
            >
              <Button 
                type="text" 
                danger 
                icon={<DeleteOutlined />} 
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const filteredData = data.filter(item => 
    String(item.nomor).toLowerCase().includes(searchText.toLowerCase()) ||
    (item.nama && item.nama.toLowerCase().includes(searchText.toLowerCase()))
  );

  const tableColumns = (canUpdate || canDelete) 
    ? [...columns] 
    : columns.filter(col => col.key !== 'action');

  if (!mounted) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Master Data RW</Title>
          <Text type="secondary">Kelola data Rukun Warga (RW) di lingkungan Anda</Text>
        </div>
        <TableActions
          onSearch={setSearchText}
          onAdd={canCreate ? () => handleOpenModal() : null}
          addText={canCreate ? "Tambah RW" : null}
        />
      </div>

      <DataTable
        columns={tableColumns}
        dataSource={filteredData}
        loading={loading}
      />

      <Modal
        title={editingItem ? 'Edit Data RW' : 'Tambah RW Baru'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        centered
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ nomor: '', nama: '' }}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="Nomor RW"
            name="nomor"
            rules={[{ required: true, message: 'Silakan masukkan nomor RW!' }]}
          >
            <Input type="number" placeholder="Contoh: 1" size="large" />
          </Form.Item>

          <Form.Item
            label="Nama Wilayah (Opsional)"
            name="nama"
          >
            <Input placeholder="Contoh: Wilayah Utara" size="large" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 32, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCloseModal} size="large">Batal</Button>
              <Button type="primary" htmlType="submit" size="large" style={{ fontWeight: 'bold' }}>
                Simpan Data
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
