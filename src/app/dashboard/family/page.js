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
import { EditOutlined, DeleteOutlined, UserOutlined, FilePdfOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import DataTable from '@/components/common/DataTable';
import TableActions from '@/components/common/TableActions';
import { exportDataToPDF } from '@/utils/pdfExport';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { Option } = Select;

export default function FamilyPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [mounted, setMounted] = useState(false);
  const { hasPermission } = require('@/hooks/usePermissions').usePermissions();

  // Watch selected RW to filter RTs
  const selectedRwId = Form.useWatch('rw_id', form);

  // Options for selects
  const [rws, setRws] = useState([]);
  const [rts, setRts] = useState([]);

  // Filtered RTs based on selected RW
  const filteredRts = selectedRwId 
    ? rts.filter(rt => rt.rw_id === selectedRwId) 
    : [];

  const filteredData = data.filter(item => {
    const headModel = item.resident?.find(r => r.status_dalam_keluarga === 'kepala_keluarga');
    const searchLower = searchText.toLowerCase();
    const rtStr = String(item.rt?.nomor || '').padStart(2, '0');
    const rwStr = String(item.rt?.rw?.nomor || '').padStart(2, '0');

    const searchString = `${item.no_kk} ${headModel?.nama || ''} ${item.alamat}`.toLowerCase();
    
    return searchString.includes(searchLower) || 
           rtStr.includes(searchLower) || 
           rwStr.includes(searchLower) ||
           `rt ${rtStr}`.includes(searchLower) ||
           `rw ${rwStr}`.includes(searchLower);
  });

  const exportToPDF = () => {
    const tableColumn = ["No", "No. KK", "Kepala Keluarga", "Alamat", "RT", "Status"];
    const tableRows = [];

    filteredData.forEach((item, index) => {
      const headModel = item.resident?.find(r => r.status_dalam_keluarga === 'kepala_keluarga');
      const rowData = [
        index + 1,
        item.no_kk,
        headModel?.nama || '-',
        item.alamat,
        item.rt?.nomor || '-',
        item.status === 'aktif' ? 'Aktif' : 'Pindah/Meninggal'
      ];
      tableRows.push(rowData);
    });

    let pdfTitle = "Data Kepala Keluarga";
    if (searchText && searchText.trim() !== '') {
      // If the search contains 'rt' or 'rw' (case insensitive), print it nicely
      if (searchText.toLowerCase().includes('rt') || searchText.toLowerCase().includes('rw')) {
        pdfTitle = `Data Kepala Keluarga ${searchText.toUpperCase()}`;
      } else {
        pdfTitle = `Data Kepala Keluarga (Filter: ${searchText.toUpperCase()})`;
      }
    }

    exportDataToPDF({
      filename: `data_kk_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`,
      title: pdfTitle,
      subtitle: `Dicetak pada: ${dayjs().format('DD-MM-YYYY HH:mm')}`,
      orientation: 'p',
      headers: tableColumn,
      data: tableRows
    });
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resFamily, resRw, resRt] = await Promise.all([
        api.get('/api/family'),
        api.get('/api/master-data/rw'),
        api.get('/api/master-data/rt')
      ]);

      const families = resFamily.data.data || [];
      // Sort by RW then RT number
      const sortedFamilies = [...families].sort((a, b) => {
        const rwA = a.rt?.rw?.nomor || 0;
        const rwB = b.rt?.rw?.nomor || 0;
        if (rwA !== rwB) return rwA - rwB;
        
        const rtA = a.rt?.nomor || 0;
        const rtB = b.rt?.nomor || 0;
        return rtA - rtB;
      });

      setData(sortedFamilies);
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
    fetchData();
  }, []);

  const handleOpenModal = (item = null) => {
    setEditingItem(item);
    if (item) {
      form.setFieldsValue({
        no_kk: item.no_kk,
        alamat: item.alamat,
        rw_id: item.rt?.rw_id,
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
        await api.put(`/api/family/detail?id=${editingItem.id}`, values);
      } else {
        await api.post('/api/family', values);
      }

      notification.success({ 
        message: editingItem ? 'Data Keluarga Berhasil Diperbarui' : 'Data Keluarga Berhasil Ditambah' 
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
      await api.delete(`/api/family/detail?id=${id}`);
      notification.success({ message: 'Data Keluarga Berhasil Dihapus' });
      fetchData();
    } catch (error) {
      notification.error({ 
        message: 'Gagal menghapus data', 
        description: error.response?.data?.message || 'Terjadi kesalahan saat menghapus' 
      });
    }
  };

  const canCreate = hasPermission('action:create:family');
  const canUpdate = hasPermission('action:update:family');
  const canDelete = hasPermission('action:delete:family');
  const canExport = hasPermission('action:export:family');

  const columns = [
    {
      title: 'No. KK',
      dataIndex: 'no_kk',
      key: 'no_kk',
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.no_kk.localeCompare(b.no_kk),
    },
    {
      title: 'Kepala Keluarga',
      key: 'kepala_keluarga',
      render: (_, record) => {
        const head = record.resident?.find(r => r.status_dalam_keluarga === 'kepala_keluarga');
        return head ? <Text>{head.nama}</Text> : <Text type="secondary" italic>Belum diatur</Text>;
      },
      sorter: (a, b) => {
        const headA = a.resident?.find(r => r.status_dalam_keluarga === 'kepala_keluarga')?.nama || '';
        const headB = b.resident?.find(r => r.status_dalam_keluarga === 'kepala_keluarga')?.nama || '';
        return headA.localeCompare(headB);
      }
    },
    {
      title: 'Alamat',
      dataIndex: 'alamat',
      key: 'alamat',
      ellipsis: true,
      sorter: (a, b) => a.alamat.localeCompare(b.alamat),
    },
    {
      title: 'Wilayah',
      key: 'wilayah',
      render: (_, record) => (
        <div>
          <Tag color="blue">RW {String(record.rt?.rw?.nomor || '').padStart(2, '0')}</Tag>
          <Tag color="cyan">RT {String(record.rt?.nomor || '').padStart(2, '0')}</Tag>
        </div>
      ),
      sorter: (a, b) => {
        const rwA = a.rt?.rw?.nomor || 0;
        const rwB = b.rt?.rw?.nomor || 0;
        if (rwA !== rwB) return rwA - rwB;
        return (a.rt?.nomor || 0) - (b.rt?.nomor || 0);
      },
    },
    {
      title: 'Jml Anggota',
      key: 'jml_anggota',
      align: 'center',
      render: (_, record) => <Tag>{record._count?.resident || 0} Orang</Tag>,
      sorter: (a, b) => (a._count?.resident || 0) - (b._count?.resident || 0),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'aktif' ? 'success' : 'warning'}>
          {(status || 'aktif').toUpperCase()}
        </Tag>
      ),
      sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
    },
    {
      title: 'Aksi',
      key: 'action',
      align: 'center',
      width: 120,
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
              title="Hapus data keluarga?"
              description="Tindakan ini juga akan menghapus data warga di dalamnya."
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

  const tableColumns = (canUpdate || canDelete) 
    ? [...columns] 
    : columns.filter(col => col.key !== 'action');


  if (!mounted) return null;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <Title level={4} style={{ margin: 0 }}>Data Kepala Keluarga</Title>
          <Text type="secondary">Kelola informasi Kartu Keluarga dan wilayah tugas</Text>
        </div>
        <TableActions
          onSearch={setSearchText}
          onAdd={canCreate ? () => handleOpenModal() : null}
          addText={canCreate ? "Tambah KK" : null}
          extraActions={
            canExport ? (
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
      </div>

      <DataTable
        columns={tableColumns}
        dataSource={filteredData}
        loading={loading}
      />

      <Modal
        title={editingItem ? 'Edit Data Keluarga' : 'Tambah Keluarga Baru'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        centered
        destroyOnHidden
        width={700}
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
              label="Nomor Kartu Keluarga (No. KK)"
              name="no_kk"
              rules={[
                { required: true, message: 'Masukkan nomor KK!' },
                { pattern: /^[0-9]+$/, message: 'Nomor KK hanya boleh angka!' },
                { max: 16, message: 'Nomor KK maksimal 16 digit!' }
              ]}
              normalize={(value) => (value || '').replace(/[^0-9]/g, '')}
              style={{ gridColumn: 'span 2' }}
            >
              <Input placeholder="Contoh: 327501XXXXXXXXXX" size="large" maxLength={16} />
            </Form.Item>

            <Form.Item
              label="RW"
              name="rw_id"
              rules={[{ required: true, message: 'Pilih RW!' }]}
            >
              <Select 
                showSearch
                placeholder="Pilih RW" 
                size="large"
                onChange={() => form.setFieldValue('rt_id', null)}
                filterOption={(input, option) => {
                  const text = Array.isArray(option?.children) ? option.children.join('') : option?.children;
                  return (text || '').toString().toLowerCase().includes(input.toLowerCase());
                }}
              >
                {rws.map(rw => (
                  <Option key={rw.id} value={rw.id}>RW {rw.nomor} - {rw.nama || 'UTAMA'}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="RT"
              name="rt_id"
              rules={[{ required: true, message: 'Pilih RT!' }]}
            >
              <Select 
                showSearch
                placeholder={selectedRwId ? "Pilih RT" : "Pilih RW dahulu"} 
                size="large"
                disabled={!selectedRwId}
                filterOption={(input, option) => {
                  const text = Array.isArray(option?.children) ? option.children.join('') : option?.children;
                  return (text || '').toString().toLowerCase().includes(input.toLowerCase());
                }}
              >
                {filteredRts.map(rt => (
                  <Option key={rt.id} value={rt.id}>RT {rt.nomor}</Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Alamat Lengkap"
              name="alamat"
              rules={[{ required: true, message: 'Masukkan alamat!' }]}
              style={{ gridColumn: 'span 2' }}
            >
              <Input.TextArea placeholder="Jl. Mawar No. 123..." rows={2} />
            </Form.Item>

            {!editingItem && (
              <>
                <div style={{ gridColumn: 'span 2', marginBottom: 16 }}>
                  <Typography.Title level={5} style={{ margin: '8px 0', borderBottom: '1px solid #f0f0f0', paddingBottom: 8 }}>
                    Informasi Kepala Keluarga
                  </Typography.Title>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Data ini akan otomatis terdaftar sebagai warga pertama di keluarga ini.</Text>
                </div>

                <Form.Item
                  label="Nama Kepala Keluarga"
                  name="nama_kepala"
                  rules={[
                    { required: true, message: 'Masukkan nama kepala keluarga!' },
                    { pattern: /^[a-zA-Z\s]+$/, message: 'Nama hanya boleh berisi huruf dan spasi!' }
                  ]}
                  normalize={(value) => (value || '').replace(/[^a-zA-Z\s]/g, '')}
                >
                  <Input placeholder="Nama Lengkap sesuai KTP" size="large" />
                </Form.Item>

                <Form.Item
                  label="NIK Kepala Keluarga"
                  name="nik_kepala"
                  rules={[
                    { required: true, message: 'Masukkan NIK kepala keluarga!' },
                    { len: 16, message: 'NIK harus 16 digit!' },
                    { pattern: /^[0-9]+$/, message: 'NIK hanya boleh berisi angka!' }
                  ]}
                  normalize={(value) => (value || '').replace(/[^0-9]/g, '')}
                >
                  <Input placeholder="16 Digit NIK" size="large" maxLength={16} />
                </Form.Item>

                <Form.Item 
                  label="Jenis Kelamin" 
                  name="jenis_kelamin_kepala"
                  initialValue="L"
                >
                  <Select size="large">
                    <Option value="L">Laki-laki</Option>
                    <Option value="P">Perempuan</Option>
                  </Select>
                </Form.Item>

                <Form.Item label="Status" name="status" initialValue="aktif">
                  <Select size="large">
                    <Option value="aktif">Aktif</Option>
                    <Option value="pindah">Pindah</Option>
                    <Option value="nonaktif">Non-Aktif</Option>
                  </Select>
                </Form.Item>
              </>
            )}

            {editingItem && (
              <Form.Item label="Status" name="status" style={{ gridColumn: 'span 2' }}>
                <Select size="large">
                  <Option value="aktif">Aktif</Option>
                  <Option value="pindah">Pindah</Option>
                  <Option value="nonaktif">Non-Aktif</Option>
                </Select>
              </Form.Item>
            )}
          </div>

          <Form.Item style={{ marginBottom: 0, marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCloseModal} size="large">Batal</Button>
              <Button type="primary" htmlType="submit" size="large" style={{ fontWeight: 'bold' }}>
                Simpan Data Keluarga
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
