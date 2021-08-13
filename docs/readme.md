# The general scope per Cases Outline diagram
1. Core concepts
   1. Wallet
   2. DIDComm (DID-to-DID)
   3. Basic credentials
      1. Self-sovereign unique id credential
         1. KERI-like based PK rotation
         2. P2P restoration
      2. On-chain status credential
      3. Organization ownership credential
      4. Web-proof credential
      5. Permission credential
      6. Issued credential
      7. Request credential
      8. Communication credential
      9.  Mutual trust credential
2.  Private deduplication register
    1.  Check record
    2.  Add record
    3.  Remove record
    4.  Get record
    5.  Update record
    6.  Add comment
    7.  Read comments
    8.  Add data
    9.  Read data
    10. Process data -> Reject record / Accept record
    11. Get unprocessed records
3.  Telegram bot for deduplication register
4.  Organization interface for deduplication register
5.  Authentification widget for web service
6.  Private service / WEB API for service wallet (used for telegram-based personal custodial wallets)
    1.  Encrypted storage
    2.  Verify credentials
        1.  Presence
        2.  Permissions
        3.  Authentication / Communication
    3.  Open communication channel
    4.  Issuing credentials
        1.  Issued
        2.  Permissions
    5.  Adding credentials
    6.  Providing credentials
    7.  Request credentials
        1.  Issuing
        2.  Verification
    8.  Credentials register
        1.  Public resolve 
        2.  Private resolve
        3.  Add
        4.  Remove
        5.  Update
7.  ? Telegram based communication channel
    1.  Register DID-to-DID
    2.  Request DID-to-DID
    3.  Invite a user
    4.  Send message
    5.  Receive message
8.  Telegram based custodial-wallet
    1.  ... same as organization wallet but multi-tenant
9.  WEB App Wallet
    1.  Encrypted storage
    2.  Request credentials
        1.  Issuing
        2.  Verification
    3.  Adding credentials
    4.  Issuing credentials
        1.  Issued
        2.  Permissions
    5.  Varifying credentials
    6.  Open communication channel
10. Telegram ID verification service
    1.  Request credentials
11. Blockchain
    1.  Statuses register for DID proofs
    2.  Event hash register
    3.  Virtual accounts
        1.  Create virtual account
        2.  Close virtual account
        3.  Transact virtual account
    4.  Permissions register
        1.  For virtual accounts
            1.  Create owner
            2.  Remove owner
            3.  Create exclusive owner
        2.  For accounts
            1.  Create owner
            2.  Remove owner
        3.  For status register
            1.  Create owner
            2.  Remove owner
            3.  Create exclusive owner
            4.  Derive status