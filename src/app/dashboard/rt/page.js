'use client';

import { useState, useEffect, useMemo } from 'react';
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
  Select,
  Checkbox
} from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import DataTable from '@/components/common/DataTable';

const { Text } = Typography;

export default function RtPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [mounted, setMounted] = useState(false);
  const { hasPermission } = require('@/hooks/usePermissions').usePermissions();

  const fetchRts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/master-data/rt');
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

  const [rwOptions, setRwOptions] = useState([]);

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
    fetchRts();
    fetchRws();
  }, []);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({
        nomor: item.nomor,
        rw_id: item.rw_id,
        nomor_list: [],
      });
    } else {
      form.resetFields();
    }
    setIsModalOpen(true);
  };

  const selectedRwId = Form.useWatch('rw_id', form);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const onFinish = async (values) => {
    try {
      if (editingItem) {
        await api.put(`/api/master-data/rt/update?id=${editingItem.id}`, values);
      } else {
        await api.post('/api/master-data/rt', values);
      }

      notification.success({ 
        message: editingItem ? 'Data Berhasil Diperbarui' : 'Data Berhasil Ditambah' 
      });
      handleCloseModal();
      fetchRts();
    } catch (error) {
      notification.error({ 
        message: 'Gagal menyimpan data', 
        description: error.response?.data?.message || 'Terjadi kesalahan saat menyimpan' 
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/api/master-data/rt/delete?id=${id}`);
      notification.success({ message: 'Data Berhasil Dihapus' });
      fetchRts();
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
      title: 'RW',
      dataIndex: 'rw_nomor',
      key: 'rw_nomor',
      width: 200,
      render: (text, record) => (
        <div>
          <Text strong>RW {String(text).padStart(2, '0')}</Text>
          {record.rw_nama && (
            <>
              <br />
              <Text type="secondary" style={{ fontSize: '11px' }}>
                WILAYAH {record.rw_nama.toUpperCase()}
              </Text>
            </>
          )}
        </div>
      ),
      sorter: (a, b) => a.rw_nomor - b.rw_nomor,
    },
    {
      title: 'Daftar RT',
      key: 'rts',
      render: (_, record) => {
        const sortedRts = [...record.rts].sort((a, b) => a.nomor - b.nomor);
        return (
          <Space wrap>
            {sortedRts.map(rt => (
               <div 
                key={rt.id} 
                style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  background: '#e6f4ff', 
                  border: '1px solid #91caff', 
                  borderRadius: '6px', 
                  padding: '4px 8px',
                  marginBottom: '4px'
                }}
              >
                <span style={{ fontWeight: '500', color: '#1677ff', marginRight: '6px' }}>
                  RT {String(rt.nomor).padStart(2, '0')}
                </span>
                <Space size={4}>
                  {canUpdate && (
                    <EditOutlined 
                      style={{ color: '#1677ff', cursor: 'pointer', fontSize: '12px' }} 
                      onClick={() => handleOpenModal(rt)}
                    />
                  )}
                  {canDelete && (
                    <Popconfirm
                      title="Hapus RT?"
                      description={`Yakin menghapus RT ${String(rt.nomor).padStart(2, '0')} dari RW ${String(record.rw_nomor).padStart(2, '0')}?`}
                      onConfirm={() => handleDelete(rt.id)}
                      okText="Ya"
                      cancelText="Tidak"
                      okButtonProps={{ danger: true }}
                    >
                      <DeleteOutlined style={{ color: '#ff4d4f', cursor: 'pointer', fontSize: '12px' }} />
                    </Popconfirm>
                  )}
                </Space>
              </div>
            ))}
          </Space>
        );
      },
    },
  ];

  const groupedData = useMemo(() => {
    const groups = {};
    data.forEach(item => {
      const rwId = item.rw_id;
      if (!groups[rwId]) {
        groups[rwId] = {
          key: rwId,
          rw_id: rwId,
          rw_nomor: item.rw?.nomor || 0,
          rw_nama: item.rw?.nama || 'UTAMA',
          rts: []
        };
      }
      groups[rwId].rts.push(item);
    });
    return Object.values(groups).sort((a, b) => a.rw_nomor - b.rw_nomor);
  }, [data]);

  const filteredData = groupedData.filter(group => {
    const searchLower = searchText.toLowerCase();
    return String(group.rw_nomor).toLowerCase().includes(searchLower) ||
      (group.rw_nama && group.rw_nama.toLowerCase().includes(searchLower)) ||
      group.rts.some(rt => String(rt.nomor).toLowerCase().includes(searchLower));
  });

  const tableColumns = columns;

  if (!mounted) return null;

  return (
    <div>
      <DataTable
        title="Master Data RT"
        subtitle="Kelola data Rukun Tetangga (RT) di lingkungan Anda"
        columns={tableColumns}
        dataSource={filteredData}
        loading={loading}
        onSearch={setSearchText}
        onAdd={canCreate ? () => handleOpenModal() : null}
        addText={canCreate ? "Tambah RT" : null}
      />

      <Modal
        title={editingItem ? 'Edit Data RT' : 'Tambah RT Baru'}
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
          initialValues={{ nomor: '', rw_id: '' }}
          style={{ marginTop: 24 }}
        >
          <Form.Item
            label="ID RW Pengampu"
            name="rw_id"
            rules={[{ required: true, message: 'Silakan pilih RW!' }]}
          >
            <Select placeholder="Pilih RW" size="large" showSearch optionFilterProp="children">
              {rwOptions.map(rw => (
                <Select.Option key={rw.id} value={rw.id}>
                  RW {String(rw.nomor).padStart(2, '0')} {rw.nama ? `- ${rw.nama}` : ''}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {editingItem ? (
            <Form.Item
              label="Nomor RT"
              name="nomor"
              rules={[{ required: true, message: 'Silakan masukkan nomor RT!' }]}
            >
              <Input type="number" placeholder="Contoh: 1" size="large" />
            </Form.Item>
          ) : (
            <Form.Item
              label="Pilih Nomor RT (Bisa lebih dari 1)"
              name="nomor_list"
              rules={[{ required: true, message: 'Silakan pilih minimal 1 nomor RT!' }]}
            >
              <Checkbox.Group disabled={!selectedRwId}>
                <Space wrap>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <Checkbox key={num} value={num}>
                      RT {num}
                    </Checkbox>
                  ))}
                </Space>
              </Checkbox.Group>
            </Form.Item>
          )}

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
