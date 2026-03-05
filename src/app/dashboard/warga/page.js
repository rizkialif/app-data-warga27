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
  Select,
  DatePicker,
  Row,
  Col
} from 'antd';
import { EditOutlined, DeleteOutlined, FilePdfOutlined } from '@ant-design/icons';
import api from '@/lib/api';
import DataTable from '@/components/common/DataTable';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import dayjs from 'dayjs';

const { Text } = Typography;
const { Option } = Select;

export default function ResidentPage() {
  const [data, setData] = useState([]);
  const [families, setFamilies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [mounted, setMounted] = useState(false);
  const { hasPermission } = require('@/hooks/usePermissions').usePermissions();

  const watchTanggalLahir = Form.useWatch('tanggal_lahir', form);
  const watchFamilyId = Form.useWatch('family_id', form);

  const selectedFamily = families.find(f => f.id === watchFamilyId);
  const hasKepalaKeluarga = selectedFamily?.resident?.some(r => r.status_dalam_keluarga === 'kepala_keluarga');
  const isEditingKepalaKeluarga = editingItem?.status_dalam_keluarga === 'kepala_keluarga' && editingItem?.family_id === watchFamilyId;
  const showKepalaKeluargaOption = !hasKepalaKeluarga || isEditingKepalaKeluarga;

  useEffect(() => {
    if (watchTanggalLahir) {
      const birthDate = dayjs(watchTanggalLahir);
      const today = dayjs();
      const age = today.diff(birthDate, 'year');
      form.setFieldsValue({ usia: `${age} Tahun` });
    } else {
      form.setFieldsValue({ usia: '' });
    }
  }, [watchTanggalLahir, form]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resResident, resFamily] = await Promise.all([
        api.get('/api/resident'),
        api.get('/api/family'),
      ]);

      const residents = resResident.data.data || [];
      const parentFamilies = resFamily.data.data || [];

      // Sort logic
      // Status hierarchy: Kepala Keluarga (1) -> Istri (2) -> Anak (3) -> Lainnya (4)
      const statusOrder = {
        'kepala_keluarga': 1,
        'istri': 2,
        'anak': 3,
        'lainnya': 4
      };

      const sortedResidents = [...residents].sort((a, b) => {
        // 1. Sort by RT Number
        const rtA = a.family?.rt?.nomor || Number.MAX_SAFE_INTEGER;
        const rtB = b.family?.rt?.nomor || Number.MAX_SAFE_INTEGER;
        if (rtA !== rtB) {
          return rtA - rtB;
        }

        // 2. Sort by No. KK (Grouping within the same RT)
        const kkA = a.family?.no_kk || '';
        const kkB = b.family?.no_kk || '';
        if (kkA !== kkB) {
          return kkA.localeCompare(kkB);
        }

        // 3. Sort by Family Status within the same Family
        const statusA = statusOrder[a.status_dalam_keluarga] || 5;
        const statusB = statusOrder[b.status_dalam_keluarga] || 5;
        return statusA - statusB;
      });

      setData(sortedResidents);
      setFamilies(parentFamilies);
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
        nik: item.nik,
        nama: item.nama,
        jenis_kelamin: item.jenis_kelamin,
        tempat_lahir: item.tempat_lahir,
        tanggal_lahir: item.tanggal_lahir ? dayjs(item.tanggal_lahir) : null,
        usia: item.tanggal_lahir ? `${dayjs().diff(dayjs(item.tanggal_lahir), 'year')} Tahun` : '',
        agama: item.agama,
        pekerjaan: item.pekerjaan,
        status_perkawinan: item.status_perkawinan,
        status_dalam_keluarga: item.status_dalam_keluarga,
        status_warga: item.status_warga,
        family_id: item.family_id,
      });
    } else {
      form.resetFields();
      form.setFieldsValue({ usia: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const onFinish = async (values) => {
    try {
      const payload = {
        ...values,
        tanggal_lahir: values.tanggal_lahir ? values.tanggal_lahir.format('YYYY-MM-DD') : null,
      };

      if (editingItem) {
        await api.put(`/api/resident/detail?id=${editingItem.id}`, payload);
      } else {
        await api.post('/api/resident', payload);
      }

      notification.success({ 
        message: editingItem ? 'Data Warga Berhasil Diperbarui' : 'Data Warga Berhasil Ditambah' 
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
      await api.delete(`/api/resident/detail?id=${id}`);
      notification.success({ message: 'Data Warga Berhasil Dihapus' });
      fetchData();
    } catch (error) {
      notification.error({ 
        message: 'Gagal menghapus data', 
        description: error.response?.data?.message || 'Terjadi kesalahan saat menghapus' 
      });
    }
  };

  const canCreate = hasPermission('action:create:warga');
  const canUpdate = hasPermission('action:update:warga');
  const canDelete = hasPermission('action:delete:warga');
  const canExport = hasPermission('action:export:warga');

  const columns = [
    {
      title: 'NIK',
      dataIndex: 'nik',
      key: 'nik',
      render: (text) => <Text strong>{text}</Text>,
      sorter: (a, b) => a.nik.localeCompare(b.nik),
    },
    {
      title: 'Nama Lengkap',
      dataIndex: 'nama',
      key: 'nama',
      sorter: (a, b) => a.nama.localeCompare(b.nama),
    },
    {
      title: 'JK',
      dataIndex: 'jenis_kelamin',
      key: 'jenis_kelamin',
      width: 60,
      align: 'center',
      render: (jk) => (
        <Tag color={jk === 'L' ? 'blue' : 'magenta'}>
          {jk}
        </Tag>
      ),
      sorter: (a, b) => a.jenis_kelamin.localeCompare(b.jenis_kelamin),
    },
    {
      title: 'No. KK',
      key: 'no_kk',
      render: (_, record) => record.family?.no_kk || '-',
      sorter: (a, b) => (a.family?.no_kk || '').localeCompare(b.family?.no_kk || ''),
    },
    {
      title: 'Wilayah',
      key: 'wilayah',
      render: (_, record) => (
        <div>
          <Tag color="blue">RW {String(record.family?.rt?.rw?.nomor || '').padStart(2, '0')}</Tag>
          <Tag color="cyan">RT {String(record.family?.rt?.nomor || '').padStart(2, '0')}</Tag>
        </div>
      ),
      sorter: (a, b) => {
        const rwA = a.family?.rt?.rw?.nomor || 0;
        const rwB = b.family?.rt?.rw?.nomor || 0;
        if (rwA !== rwB) return rwA - rwB;
        return (a.family?.rt?.nomor || 0) - (b.family?.rt?.nomor || 0);
      },
    },
    {
      title: 'Hubungan',
      dataIndex: 'status_dalam_keluarga',
      key: 'status_dalam_keluarga',
      render: (status) => <Tag color="orange">{status.replace('_', ' ').toUpperCase()}</Tag>,
      sorter: (a, b) => a.status_dalam_keluarga.localeCompare(b.status_dalam_keluarga),
    },
    {
      title: 'Status',
      dataIndex: 'status_warga',
      key: 'status_warga',
      render: (status) => (
        <Tag color={status === 'aktif' ? 'success' : status === 'pindah' ? 'warning' : 'error'}>
          {(status || 'aktif').toUpperCase()}
        </Tag>
      ),
      sorter: (a, b) => (a.status_warga || '').localeCompare(b.status_warga || ''),
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
              title="Hapus data warga?"
              description="Konfirmasi penghapusan data ini secara permanen."
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

  const filteredData = data.filter(item => {
    const searchLower = searchText.toLowerCase();
    const rtStr = String(item.family?.rt?.nomor || '').padStart(2, '0');
    const rwStr = String(item.family?.rt?.rw?.nomor || '').padStart(2, '0');
    
    return item.nama.toLowerCase().includes(searchLower) ||
      item.nik.toLowerCase().includes(searchLower) ||
      item.family?.no_kk?.toLowerCase().includes(searchLower) ||
      item.family?.resident?.find(r => r.status_dalam_keluarga === 'kepala_keluarga')?.nama?.toLowerCase().includes(searchLower) ||
      rtStr.includes(searchLower) ||
      rwStr.includes(searchLower) ||
      `rt ${rtStr}`.includes(searchLower) ||
      `rw ${rwStr}`.includes(searchLower);
  });

  const exportToPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for more columns
    const tableColumn = ["No", "NIK", "Nama", "JK", "No. KK", "Wilayah", "Hubungan", "Agama", "Status"];
    const tableRows = [];

    filteredData.forEach((item, index) => {
      const rtStr = String(item.family?.rt?.nomor || '').padStart(2, '0');
      const rwStr = String(item.family?.rt?.rw?.nomor || '').padStart(2, '0');
      const wilayahStr = `RT ${rtStr} / RW ${rwStr}`;
      
      const rowData = [
        index + 1,
        item.nik,
        item.nama,
        item.jenis_kelamin,
        item.family?.no_kk || '-',
        wilayahStr,
        item.status_dalam_keluarga.replace('_', ' ').toUpperCase(),
        item.agama || '-',
        (item.status_warga || 'aktif').toUpperCase()
      ];
      tableRows.push(rowData);
    });

    doc.setFontSize(18);
    doc.text("Data Warga", 14, 15);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Dicetak pada: ${dayjs().format('DD-MM-YYYY HH:mm')}`, 14, 22);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 119, 255] }
    });

    doc.save(`data_warga_${dayjs().format('YYYYMMDD_HHmmss')}.pdf`);
  };

  if (!mounted) return null;

  return (
    <div>
      <DataTable
        title="Data Warga"
        subtitle="Kelola informasi penduduk dan status kependudukan"
        columns={tableColumns}
        dataSource={filteredData}
        loading={loading}
        onSearch={setSearchText}
        onAdd={canCreate ? () => handleOpenModal() : null}
        addText={canCreate ? "Tambah Warga" : null}
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

      <Modal
        title={editingItem ? 'Edit Data Warga' : 'Tambah Warga Baru'}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        centered
        destroyOnHidden
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ status_warga: 'aktif', jenis_kelamin: 'L', status_perkawinan: 'belum_kawin' }}
          style={{ marginTop: 24 }}
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                label="NIK (Nomor Induk Kependudukan)"
                name="nik"
                rules={[
                  { required: true, message: 'Masukkan NIK!' },
                  { len: 16, message: 'NIK harus 16 digit!' },
                  { pattern: /^[0-9]+$/, message: 'NIK hanya boleh berisi angka!' }
                ]}
                normalize={(value) => (value || '').replace(/[^0-9]/g, '')}
              >
                <Input placeholder="16 Digit NIK" size="large" maxLength={16} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Nama Lengkap"
                name="nama"
                rules={[
                  { required: true, message: 'Masukkan nama lengkap!' },
                  { pattern: /^[a-zA-Z\s]+$/, message: 'Nama hanya boleh berisi huruf dan spasi!' }
                ]}
                normalize={(value) => (value || '').replace(/[^a-zA-Z\s]/g, '')}
              >
                <Input placeholder="Nama sesuai KTP" size="large" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="Pilih Keluarga (KK)"
                name="family_id"
                rules={[{ required: true, message: 'Pilih KK!' }]}
              >
                <Select 
                  placeholder="Cari No. KK atau Nama Kepala Keluarga" 
                  size="large"
                  showSearch
                  optionFilterProp="label"
                  options={families.map(f => {
                    const headModel = f.resident?.find(r => r.status_dalam_keluarga === 'kepala_keluarga');
                    const label = `${f.no_kk} - ${headModel?.nama || 'Belum ada kepala'}`;
                    return {
                      value: f.id,
                      label: label
                    };
                  })}
                />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Jenis Kelamin"
                name="jenis_kelamin"
                rules={[{ required: true }]}
              >
                <Select size="large">
                  <Option value="L">Laki-laki</Option>
                  <Option value="P">Perempuan</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Tempat Lahir"
                name="tempat_lahir"
              >
                <Input placeholder="Kota/Kab" size="large" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item
                label="Tanggal Lahir"
                name="tanggal_lahir"
              >
                <DatePicker 
                  style={{ width: '100%' }} 
                  size="large" 
                  format="DD-MM-YYYY" 
                  disabledDate={(current) => {
                    const today = dayjs().endOf('day');
                    const minDate = dayjs().year(1945).startOf('day');
                    return current && (current > today || current < minDate);
                  }}
                />
              </Form.Item>
            </Col>
            <Col span={4}>
              <Form.Item
                label="Usia"
                name="usia"
              >
                <Input size="large" disabled style={{ backgroundColor: '#f5f5f5', color: '#000' }} placeholder="Otomatis" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Agama"
                name="agama"
                rules={[{ pattern: /^[a-zA-Z\s]+$/, message: 'Agama hanya boleh berisi huruf dan spasi!' }]}
              >
                <Input placeholder="Agama" size="large" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Pekerjaan"
                name="pekerjaan"
                rules={[{ pattern: /^[a-zA-Z\s]+$/, message: 'Pekerjaan hanya boleh berisi huruf dan spasi!' }]}
              >
                <Input placeholder="Pekerjaan" size="large" />
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item
                label="Status Perkawinan"
                name="status_perkawinan"
              >
                <Select size="large">
                  <Option value="belum_kawin">Belum Kawin</Option>
                  <Option value="kawin">Kawin</Option>
                  <Option value="cerai">Cerai</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Hubungan Keluarga"
                name="status_dalam_keluarga"
                rules={[{ required: true, message: 'Pilih hubungan!' }]}
              >
                <Select size="large">
                  {showKepalaKeluargaOption && <Option value="kepala_keluarga">Kepala Keluarga</Option>}
                  <Option value="istri">Istri</Option>
                  <Option value="anak">Anak</Option>
                  <Option value="lainnya">Lainnya</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Status Warga"
                name="status_warga"
              >
                <Select size="large">
                  <Option value="aktif">Aktif</Option>
                  <Option value="pindah">Pindah</Option>
                  <Option value="meninggal">Meninggal</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, marginTop: 24, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCloseModal} size="large">Batal</Button>
              <Button type="primary" htmlType="submit" size="large" style={{ fontWeight: 'bold' }}>
                Simpan Data Warga
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
