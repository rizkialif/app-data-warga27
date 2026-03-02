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

export default function KetuaRtPage() {
  const [data, setData] = useState([]);
  const [rtOptions, setRtOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [mounted, setMounted] = useState(false);
  const { hasPermission } = require('@/hooks/usePermissions').usePermissions();

  const fetchKetuaRts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/pengurus/ketua-rt');
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

  const fetchRts = async () => {
    try {
      const res = await api.get('/api/master-data/rt');
      setRtOptions(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch RTs', error);
    }
  };

  useEffect(() => {
    setMounted(true);
    fetchKetuaRts();
    fetchRts();
  }, []);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({
        rt_id: item.rt_id,
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
        await api.put(`/api/pengurus/ketua-rt/update?id=${editingItem.id}`, values);
      } else {
        await api.post('/api/pengurus/ketua-rt', values);
      }

      notification.success({ 
        message: editingItem ? 'Data Berhasil Diperbarui' : 'Data Berhasil Ditambah' 
      });
      handleCloseModal();
      fetchKetuaRts();
    } catch (error) {
      notification.error({ 
        message: 'Gagal menyimpan data', 
        description: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan' 
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/pengurus/ketua-rt/delete?id=${id}`);
      notification.success({ message: 'Data Berhasil Dihapus' });
      fetchKetuaRts();
    } catch (error) {
      notification.error({ 
        message: 'Gagal menghapus data', 
        description: error.response?.data?.message || 'Terjadi kesalahan saat menghapus' 
      });
    }
  };

  const canCreate = hasPermission('action:create:rt');
  const canUpdate = hasPermission('action:update:rt');
  const canDelete = hasPermission('action:delete:rt');

  const columns = [
    {
      title: 'RT',
      dataIndex: ['rt', 'nomor'],
      key: 'rt_nomor',
      render: (text) => (
        <Tag color="processing" style={{ fontWeight: 'bold', padding: '4px 12px', borderRadius: '12px' }}>
          RT {String(text).padStart(2, '0')}
        </Tag>
      ),
      sorter: (a, b) => (a.rt?.nomor || 0) - (b.rt?.nomor || 0),
    },
    {
      title: 'RW',
      dataIndex: ['rt', 'rw', 'nomor'],
      key: 'rw_nomor',
      render: (text, record) => (
        <Text strong>RW {String(text || record.rt?.rw?.nomor || 0).padStart(2, '0')}</Text>
      ),
      sorter: (a, b) => (a.rt?.rw?.nomor || 0) - (b.rt?.rw?.nomor || 0),
    },
    {
      title: 'Nama Ketua RT',
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
              description="Apakah Anda yakin ingin menghapus data Ketua RT ini?"
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
    String(item.rt?.nomor || '').toLowerCase().includes(searchText.toLowerCase()) ||
    (item.nama && item.nama.toLowerCase().includes(searchText.toLowerCase()))
  );

  const tableColumns = (canUpdate || canDelete) 
    ? [...columns] 
    : columns.filter(col => col.key !== 'action');

  if (!mounted) return null;

  return (
    <div>
      <DataTable
        title="Data Ketua RT"
        subtitle="Kelola data nama-nama Ketua Rukun Tetangga (RT)"
        columns={tableColumns}
        dataSource={filteredData}
        loading={loading}
        onSearch={setSearchText}
        onAdd={canCreate ? () => handleOpenModal() : null}
        addText={canCreate ? "Tambah Ketua RT" : null}
      />

      <Modal
        title={editingItem ? 'Edit Data Ketua RT' : 'Tambah Ketua RT'}
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
          initialValues={{ rt_id: null, nama: '' }}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="Pilih RT"
            name="rt_id"
            rules={[{ required: true, message: 'Silakan pilih RT!' }]}
          >
            <Select placeholder="Pilih Nomor RT" size="large" showSearch optionFilterProp="children">
              {rtOptions.map(rt => (
                <Select.Option key={rt.id} value={rt.id}>
                  RT {String(rt.nomor).padStart(2, '0')} - RW {String(rt.rw?.nomor || 0).padStart(2, '0')}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Nama Lengkap Ketua RT"
            name="nama"
            rules={[{ required: true, message: 'Silakan masukkan nama ketua RT!' }]}
          >
            <Input placeholder="Contoh: Budi Santoso" size="large" />
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
