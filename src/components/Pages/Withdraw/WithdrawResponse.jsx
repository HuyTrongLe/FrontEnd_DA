import React, { useState, useEffect } from "react";
import { useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { getCoinTransactionByCoinTransactionId } from "../../services/Transaction";
import { getAccountById } from "../../services/AccountService";
import { updateAccount } from "../../services/AccountService";
import { updateCoinTransaction } from "../../services/Transaction";


const WithdrawResponse = () => {

    const { coinTransactionId } = useParams();
    const [withdraw, setWithdraw] = useState({});
    const [UserId, setUserId] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            console.log('coinTransactionId:', coinTransactionId);
            const response = await getCoinTransactionByCoinTransactionId(coinTransactionId);
            console.log('response:', response);
            setWithdraw(response[0]);
        }

        fetchData();
    }, []);

    const handelApprove = async () => {
        try {

            withdraw.status = 1;
            const response2 = await updateCoinTransaction(withdraw);
            if (response2.status) {
                alert('Duyệt thành công');
                window.location.href = '/withdrawmod';
            }
            else {
                alert('Duyệt thất bại');
            }
        } catch (error) {
            console.error('Error updating account:', error);
        }
    }

    const handelCancel = async () => {
        const account = await getAccountById(withdraw.customer.accountId);
        console.log('account:', account);
        account.coin = account.coin - withdraw.coinFluctuations;
        const response = await updateAccount(account);
        withdraw.status = 0;
        const response2 = await updateCoinTransaction(withdraw);
        if (response.status && response2.status) {
            alert('Hủy thành công');
            window.location.href = '/withdrawmod';
        } else {
            alert('Hủy thất bại');
        }

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