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
  Typography,
  Select
} from 'antd';
import { EditOutlined, DeleteOutlined, UserAddOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import DataTable from '@/components/common/DataTable';

const { Text } = Typography;
const { Option } = Select;

export default function UsersPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [currentUser, setCurrentUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  // Watch selected RW to filter RTs
  const selectedRwId = Form.useWatch('rw_id', form);

  // Options for selects
  const [roles, setRoles] = useState([]);
  const [rws, setRws] = useState([]);
  const [rts, setRts] = useState([]);

  // Filtered RTs based on selected RW
  const filteredRts = selectedRwId 
    ? rts.filter(rt => rt.rw_id === selectedRwId) 
    : [];

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resUsers, resRoles, resRw, resRt] = await Promise.all([
        api.get('/api/users'),
        api.get('/api/master-data/roles'),
        api.get('/api/master-data/rw'),
        api.get('/api/master-data/rt')
      ]);

      const users = resUsers.data.data || [];
      const sortedUsers = [...users].sort((a, b) => {
        const rwA = a.rw?.nomor || 0;
        const rwB = b.rw?.nomor || 0;
        if (rwA !== rwB) return rwA - rwB;
        
        const rtA = a.rt?.nomor || 0;
        const rtB = b.rt?.nomor || 0;
        return rtA - rtB;
      });

      setData(sortedUsers);
      setRoles(resRoles.data.data || []);
      setRws(resRw.data.data || []);
      setRts(resRt.data.data || []);

    } catch (error) {
      notification.error({ 
        message: 'Error', 
        description: error.response?.data?.message || 'Gagal memuat data' 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      console.log('[DEBUG] UsersPage - Current User from LocalStorage:', user);
    }
    fetchData();
  }, []);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({
        nama: item.nama,
        username: item.username,
        email: item.email,
        role_code: item.role_code,
        rw_id: item.rw_id,
        rt_id: item.rt_id,
        status: item.status,
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
        await api.put(`/api/users/detail?id=${editingItem.id}`, values);
      } else {
        await api.post('/api/users', values);
      }

      notification.success({ 
        message: editingItem ? 'User Berhasil Diperbarui' : 'User Berhasil Ditambah' 
      });
      handleCloseModal();
      fetchData();
    } catch (error) {
      notification.error({ 
        message: 'Gagal menyimpan data', 
        description: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan' 
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/users/detail?id=${id}`);
      notification.success({ message: 'User Berhasil Dihapus' });
      fetchData();
    } catch (error) {
      notification.error({ 
        message: 'Gagal menghapus data', 
        description: error.response?.data?.message || 'Terjadi kesalahan saat menghapus' 
      });
    }
  };

  const columns = [
    {
      title: 'Nama Full',
      dataIndex: 'nama',
      key: 'nama',
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.nama.localeCompare(b.nama),
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      render: (text) => <Tag color="blue">{text}</Tag>,
      sorter: (a, b) => a.username.localeCompare(b.username),
    },
    {
      title: 'Role',
      dataIndex: 'role_code',
      key: 'role_code',
      render: (text, record) => (
        <Tag color="purple">{record.roles?.name || text.toUpperCase()}</Tag>
      ),
      sorter: (a, b) => a.role_code.localeCompare(b.role_code),
    },
    {
      title: 'Wilayah',
      key: 'wilayah',
      render: (_, record) => (
        <div style={{ fontSize: '12px' }}>
          {record.rw && <Text type="secondary">RW {record.rw.nomor} </Text>}
          {record.rt && <Text type="secondary">/ RT {record.rt.nomor}</Text>}
          {!record.rw && !record.rt && <Text type="secondary">-</Text>}
        </div>
      ),
      sorter: (a, b) => {
        const rwA = a.rw?.nomor || 0;
        const rwB = b.rw?.nomor || 0;
        if (rwA !== rwB) return rwA - rwB;
        return (a.rt?.nomor || 0) - (b.rt?.nomor || 0);
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'aktif' ? 'success' : 'error'}>
          {status.toUpperCase()}
        </Tag>
      ),
      sorter: (a, b) => a.status.localeCompare(b.status),
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      width: 120,
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="text" 
            icon={<EditOutlined style={{ color: '#1677ff' }} />} 
            onClick={() => handleOpenModal(record)}
          />
          <Popconfirm
            title="Hapus user?"
            description="Tindakan ini tidak bisa dibatalkan."
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
        </Space>
      ),
    },
  ];

  // Only show action column for admins
  const isAdmin = currentUser?.role_code === 'admin';
  const tableColumns = isAdmin 
    ? [...columns] 
    : columns.filter(col => col.key !== 'action');

  const filteredData = data.filter(item => 
    item.nama.toLowerCase().includes(searchText.toLowerCase()) ||
    item.username.toLowerCase().includes(searchText.toLowerCase()) ||
    item.email.toLowerCase().includes(searchText.toLowerCase())
  );

  if (!mounted) return null;

  return (
    <div>
      <DataTable
        title="Manajemen Pengguna"
        subtitle="Kelola akun pengguna, peran, dan wilayah tugas"
        columns={tableColumns}
        dataSource={filteredData}
        loading={loading}
        onSearch={setSearchText}
        onAdd={isAdmin ? () => handleOpenModal() : null}
        addText={isAdmin ? "Tambah User" : null}
      />

      <Modal
        title={editingItem ? 'Edit User' : 'Tambah User Baru'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        centered
        destroyOnHidden
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ status: 'aktif' }}
          style={{ marginTop: 24 }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px' }}>
            <Form.Item
              label="Nama Lengkap"
              name="nama"
              rules={[{ required: true, message: 'Masukkan nama lengkap!' }]}
            >
              <Input placeholder="Contoh: Budi Santoso" size="large" />
            </Form.Item>

            <Form.Item
              label="Username"
              name="username"
              rules={[{ required: true, message: 'Masukkan username!' }]}
            >
              <Input placeholder="budi_rt01" size="large" disabled={!!editingItem} />
            </Form.Item>

            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Masukkan email!' },
                { type: 'email', message: 'Format email tidak valid!' }
              ]}
            >
              <Input placeholder="budi@example.com" size="large" />
            </Form.Item>

            <Form.Item
              label={editingItem ? "Password (Kosongkan jika tidak diubah)" : "Password"}
              name="password"
              rules={[{ required: !editingItem, message: 'Masukkan password!' }]}
            >
              <Input.Password placeholder="******" size="large" />
            </Form.Item>

            <Form.Item
              label="Role"
              name="role_code"
              rules={[{ required: true, message: 'Pilih role!' }]}
            >
              <Select placeholder="Pilih Role" size="large">
                {roles.map(role => (
                  <Option key={role.code} value={role.code}>{role.name}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Status" name="status">
              <Select size="large">
                <Option value="aktif">Aktif</Option>
                <Option value="nonaktif">Non-Aktif</Option>
              </Select>
            </Form.Item>

            <Form.Item label="Wilayah RW" name="rw_id">
              <Select 
                placeholder="Pilih RW (Opsional)" 
                size="large" 
                allowClear
                onChange={() => form.setFieldValue('rt_id', null)}
              >
                {rws.map(rw => (
                  <Option key={rw.id} value={rw.id}>RW {rw.nomor} - {rw.nama || 'UTAMA'}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Wilayah RT" name="rt_id">
              <Select 
                placeholder={selectedRwId ? "Pilih RT" : "Pilih RW terlebih dahulu"} 
                size="large" 
                allowClear
                disabled={!selectedRwId}
              >
                {filteredRts.map(rt => (
                  <Option key={rt.id} value={rt.id}>RT {rt.nomor}</Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <Form.Item style={{ marginBottom: 0, marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCloseModal} size="large">Batal</Button>
              <Button type="primary" htmlType="submit" size="large" style={{ fontWeight: 'bold' }}>
                Simpan User
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
