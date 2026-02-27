'use client';

import React from 'react';
import { Table, Input, Button, Space, Card, Typography } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';

const { Title } = Typography;

/**
 * DataTable is a reusable wrapper for Ant Design's Table component.
 * It includes a common header with title, search, and "Add" button.
 */
const DataTable = ({ 
  title, 
  subtitle,
  columns, 
  dataSource, 
  loading, 
  onSearch, 
  onAdd, 
  extraActions,
  addText = 'Tambah Data',
  rowKey = 'id',
  ...props 
}) => {
  return (
    <div className="data-table-container">
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: 24 
      }}>
        <div>
          {title && <Title level={4} style={{ margin: 0 }}>{title}</Title>}
          {subtitle && <Typography.Text type="secondary">{subtitle}</Typography.Text>}
        </div>
        
        <Space size="middle">
          {onSearch && (
            <Input
              placeholder="Cari..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              onChange={(e) => onSearch(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
          )}
          {extraActions}
          {onAdd && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={onAdd}
              size="large"
              style={{ borderRadius: '8px', fontWeight: 'bold' }}
            >
              {addText}
            </Button>
          )}
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={dataSource}
        loading={loading}
        rowKey={rowKey}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `Total ${total} data`,
        }}
        bordered
        style={{ borderRadius: '8px', overflow: 'hidden' }}
        {...props}
      />
    </div>
  );
};

export default DataTable;
