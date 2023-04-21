import i18n from '../i18n';

import { Colors } from '../constants/Colors';
import { ElementType, ILinkElement } from './types';

export const createParagraphNode = () => ({
  type: ElementType.PARAGRAPH_TWO,
  children: [{ text: '' }],
});

export const createLinkNode = (href: string, text: string): ILinkElement => ({
  type: ElementType.LINK,
  href,
  children: [{ text }],
});

export const createNotificationNode = (notificationType: string) => ({
  type: notificationType || ElementType.NOTIFICATION_INFO,
  children: [{ text: '' }],
});

export const createContactCardNode = () => {
  return {
    type: ElementType.CARD,
    children: [
      {
        children: [{ type: ElementType.CARD_TITLE, children: [{ text: i18n.t('common:card.contact_information') }] }],
      },
      {
        children: [{ text: '' }],
      },
      {
        children: [{ text: i18n.t('common:card.responsibility'), bold: true }],
      },
      {
        children: [{ text: '' }],
      },
      {
        children: [{ text: i18n.t('common:card.name') }],
      },
      {
        children: [{ text: '' }],
      },
      {
        children: [{ text: i18n.t('common:card.phone_number') }],
      },
      {
        children: [{ text: '' }],
      },
      {
        children: [{ text: i18n.t('common:card.email'), color: Colors.midblue }],
      },
      {
        children: [{ text: '' }],
      },
      {
        children: [{ text: '' }],
      },
      {
        children: [{ text: i18n.t('common:card.responsibility'), bold: true }],
      },
      {
        children: [{ text: '' }],
      },
      {
        children: [{ text: i18n.t('common:card.name') }],
      },
      {
        children: [{ text: '' }],
      },
      {
        children: [{ text: i18n.t('common:card.phone_number') }],
      },
      {
        children: [{ text: '' }],
      },
      {
        children: [{ text: i18n.t('common:card.email'), color: Colors.midblue }],
      },
    ],
  };
};
