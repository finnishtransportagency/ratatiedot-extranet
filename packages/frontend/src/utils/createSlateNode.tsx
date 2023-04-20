import { Colors } from '../constants/Colors';
import { ElementType, ILinkElement } from './types';

export const createLinkNode = (href: string, text: string): ILinkElement => ({
  type: ElementType.LINK,
  href,
  children: [{ text }],
});

export const createContactCardNode = () => ({
  type: ElementType.CARD,
  children: [
    {
      children: [{ type: ElementType.CARD_TITLE, children: [{ text: 'Yhteystiedot' }] }],
    },
    {
      children: [{ text: '' }],
    },
    {
      children: [{ text: 'Vastuullisuus 1', bold: true }],
    },
    {
      children: [{ text: '' }],
    },
    {
      children: [{ text: 'Henkilö nimi 1' }],
    },
    {
      children: [{ text: '' }],
    },
    {
      children: [{ text: 'Puhelin numero 1' }],
    },
    {
      children: [{ text: '' }],
    },
    {
      children: [{ text: 'test1@example.com', color: Colors.midblue }],
    },
    {
      children: [{ text: '' }],
    },
    {
      children: [{ text: '' }],
    },
    {
      children: [{ text: 'Vastuullisuus 2', bold: true }],
    },
    {
      children: [{ text: '' }],
    },
    {
      children: [{ text: 'Henkilö nimi 2' }],
    },
    {
      children: [{ text: '' }],
    },
    {
      children: [{ text: 'Puhelin numero 2' }],
    },
    {
      children: [{ text: '' }],
    },
    {
      children: [{ text: 'test2@example.com', color: Colors.midblue }],
    },
  ],
});
