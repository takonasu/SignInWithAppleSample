# SignInWithAppleサンプル
SignInWithAppleによる認証実装のサンプル

CSFRなど、各種攻撃の対策はされておらず、SignInWithAppleを手軽に試す目的で作られている。

Postgress + Node.js(express)
# AppleDeveloperPortalについて
SignInWithAppleをWEBで利用するためには、以下の3つが必要である。
これらは、[AppleDeveloperポータル](https://developer.apple.com/account/resources/certificates/list)で作成できる。
- App ID
- Services ID 
- Keys

以下は私が認識している情報で誤りがある可能性があることに注意。

1つのAppIDに対して、ServiceIDが複数（？）紐つく。
SignInWithApple用にServiceIDを発行する必要があるが、それは何らかのAppIDと紐つけなければならない。
SignInWithAppleを利用した時にクライアントに表示されるサービス名はServiceIDとなる。
また、SignInWithApple用のKeyを発行する際も特定のAppIDを紐つけなければならない。

ServiceIDについては、SignInWithAppleで利用するcallback先のURLを指定してあげる必要がある（Website URLsと表記されている）。また、HTTPSが必須であり、localhostをcallback先としては指定できない。
つまり、開発段階でもHTTPS環境＋ドメインが必要である。
本サンプルはHTTPSで動作する。ドメインに関しては各自の独自ドメインを開発コンピュータのローカルアドレスと紐つけて、それをcallback先のURLを指定してあげれば良いだろう。

# 環境構築
## 各種キー
`./keys`ディレクトリに以下の名前で各種キーを保存すること。
- `appleAuthPrivatekey.p8` SignInWithAppleで利用するClientSecret。
- `cert.pem` HTTPS通信に用いる
- `privatekey.pem` HTTPS通信に用いる
### appleAuthPrivatekey.p8
[AppleDeveloperポータル](https://developer.apple.com/account/resources/authkeys/list)より鍵を発行。
AppleDeveloperPortalについての章で記述しているkeyにあたる。
### cert.pemとprivatekey.pem
下記コマンドを実行することでHTTPS通信に必要なキーを発行できるので、それを格納する。
`$openssl req -x509 -newkey rsa:2048 -keyout privatekey.pem -out cert.pem -nodes -days 365`

## 環境変数
`.env_sample`を`.env`にリネームして必要な情報を埋めること。AppleDeveloperポータルより取得すること。
- CLIENT_ID 作成したserviceIDのIdentifier 
- TEAM_ID あなたの開発者アカウント情報。[こちら](https://developer.apple.com/account#MembershipDetailsCard)から閲覧
- KEY_ID 作成したkeyのId。View Key Detailsから見ることができる。
- REDIRECT_URI serviceIDを作成する時に指定したcallbackURLを指定する。

## 立ち上げ
Dockerを用いている。
`docker-compose up -d`
で実行すること。

## DBの構築
postgressコンテナはDBを作成するためには

```
psql -U postgres
CREATE DATABASE signinwithapple;
```
を実行すること。

# 実行方法
nodeコンテナ内で実行すること。
## 動くか試す
```
$ yarn dev
```

## コンパイルして吐き出す
```
$ yarn build
```
## コンパイル済みのものを実行する
```
$ yarn start
```
## コードをフォーマットする
```
$ yarn format
```


# 参考資料
- [TypeORMチュートリアル](https://typeorm.io/)
- [apple-signin-auth](https://www.npmjs.com/package/apple-signin-auth)