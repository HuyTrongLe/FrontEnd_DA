import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getReportById, updateReport } from '../../services/ReportService';
import { Box, Typography, Button, TextareaAutosize, Card, CardContent } from '@mui/material';
import Swal from 'sweetalert2'; // Import SweetAlert2
import {useSocket} from '../../../App'
import {createNotification} from '../../services/NotificationService'
import {getAccountById} from '../../services/AccountService'
const ReportResponse = () => {
    const { reportId } = useParams();
    const [report, setReport] = useState({});
    const [response, setResponse] = useState('');
    const [UserId, setUserId] = useState('');
    const [idusersendrp,setIdsersendrp]=useState('');
    const [usernamerp,setUsernamerp]=useState('');

    useEffect(() => {
        const fetchData = async () => {
            const reportDetail = await getReportById(reportId);
            if (reportDetail) {
                setReport(reportDetail);
                const storedUserId = Cookies.get('UserId');
                if (storedUserId) {
                    setUserId(storedUserId);
                }
                setIdsersendrp(report.customerId);
                const usernamesendrp = await getAccountById(idusersendrp);
                setUsernamerp(usernamesendrp.userName);

            }
        }

        fetchData();
    }, [reportId,report,idusersendrp]);

    const handleCancel = async (id) => {
        if (response) {
            report.status = 0;
            report.response = response;
            report.employeeId = UserId;
            const response2 = await updateReport(id, report);
            if (response2.status) {
                // Sử dụng SweetAlert2 để thông báo
                Swal.fire({
                    icon: 'success',
                    title: 'Cập nhật báo cáo thành công',
                    text: 'Trạng thái báo cáo đã được thay đổi thành "Đã hủy".',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.href = '/reportmod';
                });
            }
        } else {
            // Thông báo lỗi khi không nhập phản hồi
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Vui lòng nhập chi tiết phản hồi!',
                confirmButtonText: 'OK'
            });
        }
    }

    const handleComplete = async (id) => {
        if (response) {
            report.status = 1;
            report.response = response;
            report.employeeId = UserId;
            const response2 = await updateReport(id, report);
            if (response2.status) {
                // Thông báo thành công khi hoàn thành
                Swal.fire({
                    icon: 'success',
                    title: 'Cập nhật báo cáo thành công',
                    text: 'Trạng thái báo cáo đã được thay đổi thành "Đã hoàn thành".',
                    confirmButtonText: 'OK'
                }).then(() => {
                    window.location.href = '/reportmod';
                });
            }
        } else {
            // Thông báo lỗi khi không nhập phản hồi
            Swal.fire({
                icon: 'error',
                title: 'Lỗi',
                text: 'Vui lòng nhập chi tiết phản hồi!',
                confirmButtonText: 'OK'
            });
        }
    }
    const { socket, accountOnline } = useSocket();
    const handleNotification = (text) => {
        socket.emit("sendNotification", {
            senderName: accountOnline,
            receiverName: usernamerp,
            content: text,
        });
        const addNotification = () => {
            const newNotificationData = {
                accountId: idusersendrp,
                content: text,
                date: new Date().toISOString(),
                status: 1,
            };
            createNotification(newNotificationData); // Không cần await
        };
        addNotification();
    };

    return (
        <Box className="container" sx={{ maxWidth: '1200px', margin: 'auto', padding: 2 }}>
            <Button variant="contained" color="primary" href="/reportmod" sx={{ mb: 2 }}>
                Quay lại danh sách
            </Button>

            <Typography variant="h4" align="center" sx={{ mb: 4 }}>Chi tiết ý kiến</Typography>

            <Box display="flex" justifyContent="space-between" mb={3}>
                <Card sx={{ width: '48%' }}>
                    <CardContent>
                        <Typography variant="h6">Thông tin ý kiến</Typography>
                        <Typography><strong>ID:</strong> {report.feedBackId}</Typography>
                        <Typography><strong>Tiêu đề:</strong> {report.title}</Typography>
                        <Typography><strong>Nội dung:</strong> {report.content}</Typography>
                        <Typography><strong>Ngày tạo:</strong> {new Date(report.date).toLocaleString('vi-VN', {
                            day: '2-digit',
                            month: '2-digit',
                            year: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false,
                        })}</Typography>
                        <Typography><strong>Trạng thái:</strong> 
                            {(() => {
                                if (report.status === 1) return <span style={{ color: 'green' }}>Đã xử lý</span>;
                                else if (report.status === -1) return <span style={{ color: 'yellow' }}>Chưa xử lý</span>;
                                else if (report.status === 0) return <span style={{ color: 'red' }}>Đã Hủy</span>;
                            })()}
                        </Typography>
                    </CardContent>
                </Card>

                {report.imageUrl ? (
                    <Box sx={{ width: '48%' }}>
                        <img src={report.imageUrl} alt="Report Image" style={{ width: '100%', height: 'auto' }} />
                    </Box>
                ) : (
                    <Box sx={{ width: '48%' }}>
                        <Typography variant="body1">Không có ảnh</Typography>
                    </Box>
                )}
            </Box>

            <Typography variant="h5" align="center" sx={{ mb: 3 }}>Phản hồi</Typography>

            {report.status === -1 && (
                <TextareaAutosize
                    minRows={4}
                    placeholder="Nhập phản hồi..."
                    value={response}
                    onChange={(e) => setResponse(e.target.value)}
                    style={{ width: '100%', padding: '10px' }}
                />
            )}

            {report.response && (
                <Box mt={2}>
                    <Typography variant="body1"><strong>Phản hồi:</strong> {report.response}</Typography>
                </Box>
            )}

            <Box display="flex" justifyContent="center" mt={4}>
                <Box sx={{ width: '200px', mx: 2 }}>
                    {report.status === -1 && (
                        <Button 
                            variant="contained" 
                            color="error" 
                            fullWidth 
                            onClick={() => {
                                handleCancel(report.feedBackId);
                                handleNotification(`${accountOnline} đã từ chối khiếu nại ${report.title} của bạn`);
                              }}
                        >
                            Từ chối
                        </Button>
                    )}
                </Box>

                <Box sx={{ width: '200px', mx: 2 }}>
                    {report.status === -1 && (
                        <Button 
                            variant="contained" 
                            color="success" 
                            fullWidth 
                            onClick={() => {
                                handleComplete(report.feedBackId);
                                handleNotification(`${accountOnline} đã phản hồi khiếu nại ${report.title} của bạn`);
                            }}
                        >
                            Hoàn thành
                        </Button>
                    )}
                </Box>
            </Box>
        </Box>
    );
};

export default ReportResponse;
