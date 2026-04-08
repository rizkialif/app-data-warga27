'use client';

import React from 'react';
import { Space, Input, Button } from 'antd';
import { SearchOutlined, PlusOutlined } from '@ant-design/icons';

const TableActions = ({ onSearch, onAdd, addText = 'Tambah Data', extraActions }) => {
  return (
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
  );
};

export default TableActions;
