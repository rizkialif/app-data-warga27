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
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import DataTable from '@/components/common/DataTable';

const { Text } = Typography;

export default function KetuaRwPage() {
  const [data, setData] = useState([]);
  const [rwOptions, setRwOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [mounted, setMounted] = useState(false);
  const { hasPermission } = require('@/hooks/usePermissions').usePermissions();

  const fetchKetuaRws = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/pengurus/ketua-rw');
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

  const fetchRws = async () => {
    try {
      const res = await api.get('/api/master-data/rw');
      setRwOptions(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch RWs', error);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchKetuaRws();
    fetchRws();
  }, []);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({
        rw_id: item.rw_id,
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
        await api.put(`/api/pengurus/ketua-rw/update?id=${editingItem.id}`, values);
      } else {
        await api.post('/api/pengurus/ketua-rw', values);
      }

      notification.success({ 
        message: editingItem ? 'Data Berhasil Diperbarui' : 'Data Berhasil Ditambah' 
      });
      handleCloseModal();
      fetchKetuaRws();
    } catch (error) {
      notification.error({ 
        message: 'Gagal menyimpan data', 
        description: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan' 
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/pengurus/ketua-rw/delete?id=${id}`);
      notification.success({ message: 'Data Berhasil Dihapus' });
      fetchKetuaRws();
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
      dataIndex: ['rw', 'nomor'],
      key: 'rw_nomor',
      render: (text) => (
        <Tag color="blue" style={{ fontWeight: 'bold', padding: '4px 12px', borderRadius: '12px' }}>
          RW {String(text).padStart(2, '0')}
        </Tag>
      ),
      sorter: (a, b) => (a.rw?.nomor || 0) - (b.rw?.nomor || 0),
    },
    {
      title: 'Nama Ketua RW',
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
              description="Apakah Anda yakin ingin menghapus data Ketua RW ini?"
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
    String(item.rw?.nomor || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (item.nama && item.nama.toLowerCase().includes(searchText.toLowerCase()))
  );

  const tableColumns = (canUpdate || canDelete) 
    ? [...columns] 
    : columns.filter(col => col.key !== 'action');

  if (!mounted) return null;

  return (
    <div>
      <DataTable
        title="Data Ketua RW"
        subtitle="Kelola data nama-nama Ketua Rukun Warga (RW)"
        columns={tableColumns}
        dataSource={filteredData}
        loading={loading}
        onSearch={setSearchText}
        onAdd={canCreate ? () => handleOpenModal() : null}
        addText={canCreate ? "Tambah Ketua RW" : null}
      />

      <Modal
        title={editingItem ? 'Edit Data Ketua RW' : 'Tambah Ketua RW'}
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
          initialValues={{ rw_id: null, nama: '' }}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="Pilih RW"
            name="rw_id"
            rules={[{ required: true, message: 'Silakan pilih RW!' }]}
          >
            <Select placeholder="Pilih Nomor RW" size="large" showSearch optionFilterProp="children">
              {rwOptions.map(rw => (
                <Select.Option key={rw.id} value={rw.id}>
                  RW {String(rw.nomor).padStart(2, '0')} {rw.nama ? `- ${rw.nama}` : ''}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Nama Lengkap Ketua RW"
            name="nama"
            rules={[{ required: true, message: 'Silakan masukkan nama ketua RW!' }]}
          >
            <Input placeholder="Contoh: Achmad" size="large" />
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
