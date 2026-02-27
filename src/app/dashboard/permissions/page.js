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

const { Text } = Typography;

export default function PermissionsPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [currentUser, setCurrentUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/master-data/permissions');
      setData(res.data.data || []);
    } catch (error) {
      notification.error({ 
        message: 'Gagal mengambil data permissions', 
        description: error.response?.data?.message || 'Terjadi kesalahan sistem' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    fetchPermissions();
  }, []);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({
        code: item.code,
        name: item.name,
        description: item.description,
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
        await api.put(`/api/master-data/permissions/update?code=${editingItem.code}`, values);
      } else {
        await api.post('/api/master-data/permissions', values);
      }

      notification.success({ 
        message: editingItem ? 'Permission Berhasil Diperbarui' : 'Permission Berhasil Ditambah' 
      });
      handleCloseModal();
      fetchPermissions();
    } catch (error) {
      notification.error({ 
        message: 'Gagal menyimpan data', 
        description: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan' 
      });
    }
  };

  const handleDelete = async (code) => {
    try {
      await api.delete(`/api/master-data/permissions/delete?code=${code}`);
      notification.success({ message: 'Permission Berhasil Dihapus' });
      fetchPermissions();
    } catch (error) {
      notification.error({ 
        message: 'Gagal menghapus data', 
        description: error.response?.data?.message || 'Terjadi kesalahan saat menghapus' 
      });
    }
  };

  const isAdmin = currentUser?.role_code === 'admin';

  const columns = [
    {
      title: 'Kode Izin',
      dataIndex: 'code',
      key: 'code',
      render: (text) => (
        <Tag color="purple" style={{ fontWeight: 'bold' }}>
          {text.toUpperCase()}
        </Tag>
      ),
      sorter: (a, b) => a.code.localeCompare(b.code),
    },
    {
      title: 'Nama Izin',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Deskripsi',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <Text type="secondary">{text || '-'}</Text>,
      sorter: (a, b) => (a.description || '').localeCompare(b.description || ''),
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      width: 150,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined style={{ color: '#1677ff' }} />} 
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="Hapus izin?"
            description="Konfirmasi penghapusan permission ini."
            onConfirm={() => handleDelete(record.code)}
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
        </Space>
      ),
    },
  ];

  const filteredData = data.filter(item => 
    item.code.toLowerCase().includes(searchText.toLowerCase()) ||
    item.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const tableColumns = isAdmin 
    ? [...columns] 
    : columns.filter(col => col.key !== 'action');

  if (!mounted) return null;

  return (
    <div>
      <DataTable
        title="Master Data Permissions"
        subtitle="Kelola hak akses fitur dalam aplikasi"
        columns={tableColumns}
        dataSource={filteredData}
        loading={loading}
        onSearch={setSearchText}
        onAdd={isAdmin ? () => handleOpenModal() : null}
        addText={isAdmin ? "Tambah Izin" : null}
      />

      <Modal
        title={editingItem ? 'Edit Izin' : 'Tambah Izin Baru'}
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
          initialValues={{ code: '', name: '', description: '' }}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="Kode Izin (Permission Code)"
            name="code"
            rules={[
              { required: true, message: 'Silakan masukkan kode izin!' },
              { pattern: /^[a-z_:]+$/, message: 'Gunakan huruf kecil, garis bawah, atau titik dua (a-z, _, :)' }
            ]}
          >
            <Input placeholder="Contoh: users:create" size="large" disabled={!!editingItem} />
          </Form.Item>

          <Form.Item
            label="Nama Izin"
            name="name"
            rules={[{ required: true, message: 'Silakan masukkan nama izin!' }]}
          >
            <Input placeholder="Contoh: Create User" size="large" />
          </Form.Item>

          <Form.Item
            label="Deskripsi"
            name="description"
          >
            <Input.TextArea placeholder="Penjelasan singkat kegunaan izin ini" rows={3} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, marginTop: 32, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCloseModal} size="large">Batal</Button>
              <Button type="primary" htmlType="submit" size="large" style={{ fontWeight: 'bold' }}>
                Simpan Izin
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
