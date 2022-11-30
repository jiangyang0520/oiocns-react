import React, { useEffect, useRef, useState } from 'react';
import { Segmented, Card, Typography, UploadProps, Upload } from 'antd';
import { docsCtrl } from '@/ts/controller/store/docsCtrl';
import TaskListComp, { TaskModel } from './components/TaskListComp';
import ResetNameModal from './components/ResetName';
import { FaTasks } from 'react-icons/fa';
import CoppyOrMove from './components/CoppyOrMove';
import TableContent from './components/TableContent';
import CardTiltle from './components/HeadContent';
import CardListContent from './components/CardContent';
import { IconFont } from '@/components/IconFont';
import cls from './index.module.less';
import { FileItemModel } from '@/ts/base/model';
import { IObjectItem } from '@/ts/core/store/ifilesys';

type NameValue = {
  name: string;
  value: string;
};
/**
 * 仓库-文档
 * @returns
 */
const StoreDoc: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('新建文件夹');
  const [coppyOrMoveTitle, setCoppyOrMoveTitle] = useState('复制到');
  const [currentTarget, setCurrentTarget] = useState<IObjectItem>();
  const [reNameKey, setReNameKey] = useState<string | undefined>('');
  const [segmentedValue, setSegmentedValue] = useState<'Kanban' | 'List'>('Kanban');
  const [taskList, setTaskList] = useState<TaskModel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [current, setCurrent] = useState(docsCtrl.current);
  const [pageData, setPagedata] = useState<FileItemModel[]>([]);
  const [createFileName, setCreateFileName] = useState<string>('');
  const [dicExtension, setDicExtension] = useState<NameValue[]>([]);
  const uploadRef = useRef<any>();
  const parentRef = useRef<any>();
  const refreshUI = () => {
    if (docsCtrl.current != undefined) {
      setPagedata(docsCtrl.current.childrenData);
      setCurrent({ ...docsCtrl.current });
    }
  };
  useEffect(() => {
    fetch('/fileext.json').then(async (res) => {
      const temp: NameValue[] = await res.json();
      if (temp && temp.length > 0) {
        setDicExtension(temp);
      }
    });
    const id = docsCtrl.subscribe(refreshUI);
    docsCtrl.subscribePart('taskList', (taskList: any) => {
      setTaskList([...taskList]);
    });
    return () => {
      docsCtrl.unsubscribe(id);
      docsCtrl.unsubscribePart('taskList');
    };
  }, []);
  const uploadProps: UploadProps = {
    multiple: true,
    showUploadList: false,
    async customRequest(options) {
      const file = options.file as File;
      if (docsCtrl.current && file) {
        docsCtrl.upload(docsCtrl.current.key, file.name, file);
      }
    },
  };
  const getThumbnail = (item: FileItemModel) => {
    if (item.thumbnail.length > 0) {
      return item.thumbnail;
    }
    let prifex = '/icons/';
    if (item.extension === '') {
      return prifex + 'default_folder.svg';
    } else {
      for (const d of dicExtension) {
        if (d.name === item.extension.toLowerCase()) {
          return prifex + 'file_type_' + d.value + '.svg';
        }
      }
    }
    return prifex + 'default_file.svg';
  };
  const getPreview = (el: FileItemModel) => {
    if (el.thumbnail?.length > 0) {
      return {
        src: '/orginone/anydata/bucket/load/' + el.shareLink,
      };
    }
    return false;
  };
  const handleMenuClick = async (key: string, node: any) => {
    switch (key) {
      case '1': // 删除
        if (await docsCtrl.refItem(node.key)?.delete()) {
          docsCtrl.changCallback();
        }
        break;
      case '2': // 重命名
        setReNameKey(node.key);
        setCreateFileName(node.name);
        setTitle('重命名');
        setIsModalOpen(true);
        break;
      case '3': // 移动到
        setCurrentTarget(docsCtrl.refItem(node.key));
        setCoppyOrMoveTitle('移动到');
        setMoveModalOpen(true);
        break;
      case '4': // 复制到
        setCurrentTarget(docsCtrl.refItem(node.key));
        setCoppyOrMoveTitle('复制到');
        setMoveModalOpen(true);
        break;
      case '5': // 下载
        break;
      case '刷新': // 刷新
        docsCtrl.current?.loadChildren(true);
        docsCtrl.changCallback();
        break;
      case '新建文件夹': // 新建文件夹
        setReNameKey(undefined);
        setTitle('新建文件夹');
        setCreateFileName('');
        setIsModalOpen(true);
        break;
      case '上传': // 上传
        if (uploadRef && uploadRef.current && uploadRef.current.upload) {
          uploadRef.current.upload.uploader.onClick();
        }
        break;
      default:
        break;
    }
  };
  return (
    <Card
      className={cls.pageCard}
      title={<CardTiltle handleMenuClick={handleMenuClick} current={current} />}
      extra={
        <Typography.Link onClick={() => setOpen(true)}>
          <FaTasks fontSize={18}></FaTasks>
        </Typography.Link>
      }
      bordered={false}>
      <div className={cls.mainContent} ref={parentRef}>
        {segmentedValue === 'List' ? (
          <TableContent
            parentRef={parentRef}
            pageData={pageData}
            getThumbnail={getThumbnail}
            getPreview={getPreview}
            handleMenuClick={handleMenuClick}
          />
        ) : (
          <CardListContent
            pageData={pageData}
            getThumbnail={getThumbnail}
            handleMenuClick={handleMenuClick}
            getPreview={getPreview}
          />
        )}
      </div>
      <Segmented
        value={segmentedValue}
        onChange={(value) => setSegmentedValue(value as 'Kanban' | 'List')}
        options={[
          {
            value: 'List',
            icon: (
              <IconFont
                type={'icon-chuangdanwei'}
                className={segmentedValue === 'List' ? 'active' : ''}
              />
            ),
          },
          {
            value: 'Kanban',
            icon: (
              <IconFont
                type={'icon-jianyingyong'}
                className={segmentedValue === 'Kanban' ? 'active' : ''}
              />
            ),
          },
        ]}
      />
      <ResetNameModal
        title={title}
        open={isModalOpen}
        reNameKey={reNameKey}
        value={createFileName}
        onChange={setIsModalOpen}
      />
      <CoppyOrMove
        currentTaget={currentTarget}
        open={moveModalOpen}
        title={coppyOrMoveTitle}
        onChange={setMoveModalOpen}
      />

      <TaskListComp
        isOpen={open}
        taskList={taskList}
        onClose={() => {
          setOpen(false);
        }}
      />
      <Upload {...uploadProps} ref={uploadRef}></Upload>
    </Card>
  );
};
export default StoreDoc;
