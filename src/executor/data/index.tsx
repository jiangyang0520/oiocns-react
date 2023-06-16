import React from 'react';
import ExecutorOpen from './open';
import orgCtrl from '@/ts/controller';
interface IProps {
  cmd: string;
  args: any[];
  finished: () => void;
}
const DataExecutor: React.FC<IProps> = ({ cmd, args, finished }) => {
  switch (cmd) {
    case 'open':
    case 'remark':
      if (args && args.length > 0) {
        return <ExecutorOpen cmd={cmd} file={args[0]} finished={finished} />;
      }
      break;
    case 'delete':
      if ('delete' in args[0]) {
        args[0].delete().then((success: boolean) => {
          if (success) {
            orgCtrl.changCallback();
          }
        });
      }
      break;
  }
  return <></>;
};

export default DataExecutor;