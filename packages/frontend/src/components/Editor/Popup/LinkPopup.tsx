import styled from '@emotion/styled';
import { Box } from '@mui/material';
import { useFocused, useSelected, useSlateStatic } from 'slate-react';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { ILinkElement, removeLink, SlateElementProps } from '../../../utils/slateEditorUtil';
import LinkOffIcon from '../../../assets/icons/LinkOff.svg';
import { useContext } from 'react';
import { AppBarContext } from '../../../contexts/AppBarContext';

interface LinkPopupProps extends SlateElementProps {}

export const LinkPopup = ({ attributes, element, children }: LinkPopupProps) => {
  const editor = useSlateStatic();
  const selected = useSelected();
  const focused = useFocused();

  const { openToolbar } = useContext(AppBarContext);
  const url = (element as ILinkElement).href;
  return (
    <LinkPopUpContainer {...attributes}>
      <a
        href={url}
        rel="noreferrer"
        target="_blank"
        onClick={() => {
          if (!openToolbar) {
            window.open(url, '_blank', 'noopener,noreferrer');
          }
        }}
      >
        {children}
      </a>
      {selected && focused && (
        <PopupWrapper contentEditable={false}>
          <PopupLinkWrapper href={url} rel="noreferrer" target="_blank">
            <OpenInNewIcon fontSize="small" />
            {url}
          </PopupLinkWrapper>
          <Box
            component="img"
            sx={{ cursor: 'pointer', width: '25px' }}
            src={LinkOffIcon}
            onClick={() => removeLink(editor)}
          />
        </PopupWrapper>
      )}
    </LinkPopUpContainer>
  );
};

const LinkPopUpContainer = styled('div')({
  display: 'inline',
  position: 'relative',
});

const PopupWrapper = styled('div')(() => ({
  position: 'absolute',
  left: 0,
  display: 'flex',
  alignItems: 'center',
  backgroundColor: 'white',
  padding: '6px 10px',
  gap: '10px',
  borderRadius: '6px',
  border: '1px solid lightgray',
}));

const PopupLinkWrapper = styled('a')(() => ({
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  paddingRight: '10px',
  borderRight: '1px solid lightgrey',
}));
