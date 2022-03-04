## 1. 获取自己的NFT列表
```
    uint256 count = IERC721.balanceOf(owner);   // 根据地址获取自己的NFT数量
    uint256 tokenId = IERC721.tokenOfOwnerByIndex(owner, index); // 根据地址和index获得tokenId
    string tokenURI = IERC721.tokenURI(tokenId); // 根据tokenId获取NFT详情
```

## 2. 根据address和tokenId获取NFT的状态
```
    uint256 applies, value, depositExpire, redeemExpire = router.getNFTStatus(nftAddress, tokenId);
    if (value > 0) {
        // 已经定价
        // 已经定价的NFT可执行的操作为抵押
    } else if (applies > 0) {
        // 已经申请估价，等待定价
        // 不可操作
    } else {
        // 未估价
        // 未估价的NFT，根据需要先判断是否approve，如果没有approve则先approve
        // 如果已经approve，可以申请定价
    }
```


## 3. 后台获取申请报价的列表
```
    // 列举的时候，按照时间倒序排序，最后申请的放在第一个
    uint256 count = router.lastValuationApplyIndex(); // 获取待定价的NFT的数量
    (address token, uint256 tokenId, uint256 quote, uint256 timestamp) = router.queryApplyByIndex(index);   // 根据index获取token信息和用户的申请信息
```

## 4. 给某个NFT进行定价
```
    router.quote(address token, uint256 tokenId, uint256 value, uint256 depositExpire, uint256 redeemExpire)
    // redeemExpire表示用户抵押之后，超时的时长（默认2个月），不是具体的时间戳
    // 设置定价之后，会自动从申请定价的列表删除，只有设置的定价账户（后续是个多签的合约）可以定价
```

## 5. 抵押NFT
```
    (uint256 applies, value, depositExpire, redeemExpire) = router.getNFTStatus(nftAddress, tokenId); // 获取redeemExpire
    uint256 redeemDeadline_new = time.now() + redeemExpire; // 根据redeemExpire计算出当前NFT的超时时间

    // 遍历获取已经抵押的，最后一个超时时间小于当前NFT的超时时间的NFT
    uint256 index = router.lastDepositedNFTIndex();
    (address owner, uint256 value, uint256 timestamp, uint256 redeemDeadline, uint256 previous, uint256 next) = router.getDepositedNFTByIndex(index);
    while(redeemDeadline > redeemDeadline_new) {
        index = previous;
        (address owner, uint256 value, uint256 timestamp, uint256 redeemDeadline, uint256 previous, uint256 next) = router.getDepositedNFTByIndex(index);
    }
    router.deposit(token, tokenId, index); // 抵押
    // 一般情况下，如果不修改默认的redeemExpire的话，最后一个抵押的就是deposit的参数
```


## 5. 用户赎回NFT
```
    uint256 index = router.getDepositIndex(address token, uint256 tokenId); // 根据NFT的信息获取抵押的index
(address owner, uint256 value, uint256 timestamp, uint256 redeemDeadline, uint256 previous, uint256 next) = router.getDepositedNFTByIndex(index); // 根据抵押的index获取抵押信息
    if(redeemDeadline > time.now()) {
        router.redemption(token, tokenId); // 在赎回时效内可以赎回
    }    
```
