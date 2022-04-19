## 1. 获取拍卖的数量
```
    uint256 lastAuctionIndex = router.lastAuctionIndex();
```

## 2. 根据index获取拍卖的状态
```
    (address token, uint256 tokenId, uint256 startingPrice, uint256 timestamp, uint256 bidTimes, uint256 lastPrice, address lastBidder, uint256 expire, uint8 status) = auctionByIndex(uint256 index);
    // index范围是闭区间[1, lastAuctionIndex], 从1到lastAuctionIndex，index越大结束时间越晚，所以按照index从大到小排序展示

    // token是NFT合约的地址，根据token和tokenId在NFT合约中获取图片信息
    // startingPrice 起拍价格
    // timestamp 起拍时间
    // bidTimes 出价次数
    // lastPrice 最后一次出价的价格
    // lastBidder 最后一个出价的人
    // expire 拍卖结束时间
    // status 1表示未结束，需要结合expire判断 2表示正常结束，用户已经赎回   3表示拍卖超时，已经被销毁

```


## 3. 出价、赎回、销毁，都没变

## 4.