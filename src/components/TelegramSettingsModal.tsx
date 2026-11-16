import React from 'react';
import { NotificationSettingsModal } from './NotificationSettingsModal';
import { NotificationConfig } from '../types';

interface TelegramSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: NotificationConfig;
  onSaveConfig: (config: NotificationConfig) => void;
}

export const TelegramSettingsModal: React.FC<TelegramSettingsModalProps> = (props) => {
  return <NotificationSettingsModal {...props} />;
};
