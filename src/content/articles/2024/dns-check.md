---
title: Node.jsでドメインのDNSレコードをチェックする
pubDate: 2024-6-9
updatedDate: 2024-6-9
---

## 何故書こうと思ったのか

自身が運営するサイトのアカウントシステムで、Discordみたいにユーザーが作ったサイトをアカウントとリンクさせたいと思い調べたら、案外日本語記事が少ないことに気づいたので今回書きました。

## どのように取得するのか

今回はNode.jsの公式ライブラリであるdnsライブラリを使っていきます。

dnsライブラリには同期のdnsと非同期のdns/promisesがあるので、この記事では同期と非同期を分けて解説していきます。

また今回レコードを取得するドメインに関してですが、\_discord.wktk.moeにちょうどよくDiscordとリンクするためのTxtレコードがあったので、それを使っていきます。

### 同期

同期でやる場合は以下のようになります。

```js
const dns = require("dns");

dns.resolveTxt("_discord.wktk.moe", (err, records) => {
  if (err) {
    throw new Error(String(err));
  } else {
    console.log(records);
  }
});
```

今回はif (err)の部分でエラーハンドリングをしています。

エラー検知後の処理をthrow new Errorにしていますが、ここは変更しても大丈夫です。

また同期にするとインデントなどが多くなってしまい、コードが見づらくなる可能性があるので自分はあまりお勧めしません。

あくまで参考程度にしてほしいですが、自分は非同期の方を使っています。

理由は先ほど書いたインデントもそうですが、プログラムで非同期の部分が多いというのも理由の一つです。

### 非同期

非同期でやる場合は以下のようになります。

```js
const dns = require("dns/promises");

async function main() {
  try {
    let records = await dns.resolveTxt("_discord.wktk.moe");
    console.log(records);
  } catch (error) {
    throw new Error(error);
  }
}

main();
```

関数名をmainにしていますが、ここは何でもOKです。

今回はエラーハンドリングにtry catchを使いました。

またエラー検知後の処理がthrow new Errorになっていますが、変更しても大丈夫です。

個人的な感想ですが、自分は非同期の方がコードが見やすいので好きです。

## TypeScript版

今回解説したのはNode.jsだけでしたが、TypeScript版も作ったので一応書いておきます。

### 同期

```ts
import dns from "dns";

dns.resolveTxt("_discord.wktk.moe", (err, records) => {
  if (err) {
    throw new Error(String(err));
  } else {
    console.log(records);
  }
});
```

### 非同期

```ts
import dns from "dns/promises";

(async () => {
  try {
    console.log(await dns.resolveTxt("_discord.wktk.moe"));
  } catch (error) {
    throw new Error(String(error));
  }
})();
```

## 最後に

今回開設したのはTxtレコードの取得のみでしたが、他のレコードの
取得も出来るので詳しくは[こちら](https://nodejs.org/api/dns.html)のサイトを見てください

記事の修正依頼等は私の [Twitterアカウント](https://x.com/robot_neet) までお願いします。

## 引用元

https://nodejs.org/api/dns.html
