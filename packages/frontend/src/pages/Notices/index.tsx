import { useEffect, useState } from 'react';
import { getNotices } from '../../services/NoticeListService';
import { ProtectedContainerWrapper } from '../../styles/common';
import { Box, Pagination, Typography } from '@mui/material';
import { format } from 'date-fns';
import { Colors } from '../../constants/Colors';
import { DateFormat } from '../../constants/Formats';
import { useNavigate } from 'react-router-dom';
import { Notice } from '../../types/types';
import { ErrorMessage } from '../../components/Notification/ErrorMessage';
import { Routes } from '../../constants/Routes';

export const Notices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [error, setError] = useState();
  const [page, setPage] = useState(1);
  const navigate = useNavigate();
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    const fetchNotices = async () => {
      try {
        const response = await getNotices(page);
        const { notices, totalItems } = response.data;
        setNotices(notices);
        setTotalPages(Math.ceil(totalItems / 10));
      } catch (error: any) {
        setError(error);
      }
    };

    fetchNotices();
  }, [page]);

  const handlePageChange = (value: number) => {
    setPage(value);
  };

  if (error) return <ErrorMessage error={error} />;

  return (
    <ProtectedContainerWrapper>
      {notices.map((node) => {
        return (
          <Box sx={{ cursor: 'pointer' }}>
            <Typography>{format(new Date(node.createdTime), DateFormat)}</Typography>
            <Typography
              sx={{ color: Colors.darkblue, marginBottom: '12px', fontSize: '18px', fontFamily: 'Exo2-Bold' }}
              onClick={() =>
                navigate(`${Routes.NOTICES}/${format(new Date(node.publishTimeStart), DateFormat)}`, {
                  state: { noticeId: node.id },
                })
              }
            >
              {node.content[0].children[0].text}
            </Typography>
          </Box>
        );
      })}
      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, value) => handlePageChange(value)}
        sx={{ justifyContent: 'center', display: 'flex' }}
        showFirstButton
        showLastButton
      />
    </ProtectedContainerWrapper>
  );
};
