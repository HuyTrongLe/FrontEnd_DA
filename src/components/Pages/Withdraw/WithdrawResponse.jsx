import { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';

import { getCoinTransactionByCoinTransactionId } from "../../services/Transaction";
import { getAccountById } from "../../services/AccountService";
import { updateAccount } from "../../services/AccountService";
import { updateCoinTransaction } from "../../services/Transaction";

import Swal from 'sweetalert2';

const WithdrawResponse = () => {

    const { coinTransactionId } = useParams();
    const [withdraw, setWithdraw] = useState({});


    useEffect(() => {
        const fetchData = async () => {
            console.log('coinTransactionId:', coinTransactionId);
            const response = await getCoinTransactionByCoinTransactionId(coinTransactionId);
            console.log('response:', response);
            setWithdraw(response[0]);
        }
        fetchData();
    }, []);

    const confirm = async () => {
        try {
            withdraw.status = 1;
            const response2 = await updateCoinTransaction(withdraw);
            if (response2.status) {
                Swal.fire({
                    title: 'Duyệt thành công!',
                    icon: 'success',
                    confirmButtonText: 'OK',
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.location.href = '/withdrawmod';
                    }
                });

            }
            else {
                Swal.fire({
                    title: 'Duyệt rút xu thất bại!',
                    text: 'Vui lòng kiểm tra lại!',
                    icon: 'error',
                    confirmButtonText: 'OK',
                });
            }
        } catch (error) {
            console.error('Error updating account:', error);
        }
    }

    const deny = async () => {
        const account = await getAccountById(withdraw.customer.accountId);
        console.log('account:', account);
        account.coin = account.coin - withdraw.coinFluctuations;
        const response = await updateAccount(account);
        withdraw.status = 0;
        const response2 = await updateCoinTransaction(withdraw);
        if (response.status && response2.status) {
            Swal.fire({
                title: 'Hủy thành công!',
                icon: 'success',
                confirmButtonText: 'OK',
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/withdrawmod';
                }
            });
        } else {
            Swal.fire({
                title: 'Hủy rút xu thất bại!',
                text: 'Vui lòng kiểm tra lại!',
                icon: 'error',
                confirmButtonText: 'OK',
            });
        }
    }
    const handelApprove = async () => {
        Swal.fire({
            title: 'Xác nhận!',
            text: 'Bạn chắc chắn đã kiển tra đầy đủ thông tin?',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'OK',
        }).then((result) => {
            if (result.isConfirmed) {
                confirm();
            }
        });
    }

    const handelCancel = async () => {
        Swal.fire({
            title: 'Xác nhận!',
            text: 'Bạn chắc chắn muốn hủy yêu cầu này?',
            icon: 'warning',
            showCancelButton: true,
            cancelButtonText: 'Hủy',
            confirmButtonText: 'OK',
        }).then((result) => {
            if (result.isConfirmed) {
                deny();
            }
        });
    }

    return (
        <div className="container">
            <h1 className="text-center mb-4">Duyệt rút xu</h1>
            {withdraw.coinTransactionId ? (
                <div className="row">
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Thông tin giao dịch</h5>
                                <p className="card-text">
                                    <strong>ID:</strong> {withdraw.coinTransactionId}
                                </p>
                                <p className="card-text">
                                    <strong>Tên tài khoản:</strong> {withdraw.customer.userName}
                                </p>
                                <p className="card-text">
                                    <strong>Email:</strong> {withdraw.customer.email}
                                </p>
                                <p className="card-text">
                                    <strong>Số tiền yêu cầu:</strong> {withdraw.moneyFluctuations}đ
                                </p>
                                <div className="text-center">
                                    <img src={withdraw.customer.accountProfile.bankAccountQR} alt="QR Code" />
                                    <p>QR Code</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="card">
                            <div className="card-body">
                                <h5 className="card-title">Số tiền yêu cầu</h5>
                                <h1 className="text-danger">{withdraw.moneyFluctuations}đ</h1>
                                <p className="text-danger">
                                    Vui lòng kiểm tra kỹ thông tin trước khi thao tác !!!
                                </p>
                            </div>
                        </div>

                        <div className="card mt-4">
                            <div className="card-body">
                                <h5 className="card-title">Thao tác</h5>
                                <button className="btn btn-primary" onClick={() => handelApprove()}>Duyệt</button>
                                <button className="btn btn-danger ml-2" onClick={() => handelCancel()}>Hủy</button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <p>Loading...</p>
            )}
        </div>
    );
};

export default WithdrawResponse;