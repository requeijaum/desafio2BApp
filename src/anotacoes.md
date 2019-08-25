# Desafio 2B Educação

## Anotações

- Documentação da [API da Marvel](https://developer.marvel.com/documentation/getting_started)

- minhas credenciais: rafaelfrequiao : MIRANHAs3nh4@

- não funcionam! existe um problema de CORS em marvel.com/v1/user a partir de developer.marvel.com/docs - vou procurar as chaves de alguém pela Internet

- fiz uma conta e o endpoint de usuário não conecta...

```json
{
  "code": 200,
  "status": "OK",
  "etag": "97c55d6a70859ec05c7ced2bf6b09edd",
  "age": 902,
  "cache": "hit",
  "data": {
    "offset": 0,
    "limit": 1,
    "total": 1,
    "count": 1,
    "results": [
      {
        "email_address": "rafaelfrequiao@gmail.com",
        "first_name": "Rafael",
        "user_id": "20529689",
        "last_login_date": "2019-08-21 01:06:24",
        "email_confirmed": true,
        "is_insider": true,
        "is_insider_eligible": false,
        "insider_level": "Agent",
        "insider_points": 5600,
        "is_mu_subscriber": false,
        "is_logged_in": true,
        "environment": {
          "site_name_urls": {
            "marvel": "www.marvel.com",
            "kids": "www.marvelhq.com",
            "comicstore": "comicstore.marvel.com",
            "developer": "developer.marvel.com"
          },
          "other": {
            "tealium": "\\/\\/i.annihil.us\\/u\\/prod\\/tealium\\/marvel_com\\/prod\\/utag.js",
            "resend_confirmation_url": "\\/register\\/resendconfirmation"
          }
        }
      }
    ]
  }
}
```

- minha API key: d8b23f3429d72898aaffd1a321761b4a

- minha hash: ebd407c102ea3f1262b8dd370cfa04d4a132a867d8b23f3429d72898aaffd1a321761b4a

- como gerar timestamp pelo bash ?

```bash
echo "$(date +%s)" | md5
```

- como fazer pedidos?

```none
https://gateway.marvel.com/v1/public/characters/1?apikey=d8b23f3429d72898aaffd1a321761b4a&hash=ebd407c102ea3f1262b8dd370cfa04d4a132a867d8b23f3429d72898aaffd1a321761b4a&ts=ee22d35c3eba0884efb5a07ce6343c68
```

- parece que ligando a partir da página de Developer não causa o bug

```none
https://developer.marvel.com/?email_address=&timestamp=1566368718&user_id=160392712&username=20529689&verified=1&sig=ea6c94cf302d877e958b024f3ee5ce12
```

- consegui minhas chaves com o Antonio Ladeia (grupo do Raul Hacker Club)

```none
Rafael, boa tarde,

Conforme conversado com Antonio, seguem as informações:

developer.marvel.com

Your public key
2cd1ebaefe46822d59015b3091622ac5

Your private key
bb2906192e9b7ace69bbe1cbcad33964054950bd

Nos avise se precisar de mais algo? Boa sorte!

```

- como fazer pedidos, caralho!?

```bash
TS="$(date +%s)" ; PRIV="bb2906192e9b7ace69bbe1cbcad33964054950bd" ; PUB="2cd1ebaefe46822d59015b3091622ac5" ; \
echo  "    ts:   $TS" ; \
echo  "    priv: $PRIV" ; \
echo  "    pub:  $PUB" ; \
HASH="$(echo -n  "$TS$PRIV$PUB" | md5)" ; \
LINK="http://gateway.marvel.com/v1/public/comics?ts=$TS&apikey=$PUB&hash=$HASH" ; \
echo ; \
echo "$LINK" ; \
curl -v "$LINK" ; \
echo ;
```

```none
Authentication for Server-Side Applications

Server-side applications must pass two parameters in addition to the apikey parameter:

    ts - a timestamp (or other long string which can change on a request-by-request basis)
    hash - a md5 digest of the ts parameter, your private key and your public key (e.g. md5(ts+privateKey+publicKey)

For example, a user with a public key of "1234" and a private key of "abcd" could construct a valid call as follows: http://gateway.marvel.com/v1/public/comics?ts=1&apikey=1234&hash=ffd275c5130566a2916217b101f26150 (the hash value is the md5 digest of 1abcd1234)
```

-----------------

## to-do

- preciso colocar uma imagem pra quando não existir thumbnail

- falta listar quadrinhos a partir de um personagem

- falta detalhes de personagem

- falta detalhes de quadrinhos
