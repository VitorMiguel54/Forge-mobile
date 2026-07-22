# Forge Mobile

Aplicativo mobile-first do ecossistema Forge, construido com Expo Router,
React Native e TypeScript.

## Configuracao da API

O app le apenas estas variaveis publicas do Expo:

```env
EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_USER_PROFILE_ID=
```

Copie `.env.example` para `.env` e preencha o `EXPO_PUBLIC_USER_PROFILE_ID`
com um perfil existente no banco de desenvolvimento da Forge.Api.

O codigo aceita a URL base com ou sem `/api`; o `apiClient` normaliza a base
automaticamente.

## Executando em Web, Emulador e Dispositivo Fisico

### Expo Web no mesmo computador

Use `localhost`, porque o navegador esta rodando no mesmo computador da API:

```env
EXPO_PUBLIC_API_BASE_URL=https://localhost:7170/api
EXPO_PUBLIC_USER_PROFILE_ID=seu-guid-de-perfil
```

Esse e o caminho principal para demonstracao local em Web. A Forge.Api ja
possui CORS de desenvolvimento para o Expo Web local.

### Android Emulator

No Android Emulator padrao, `localhost` aponta para o proprio emulador. Use
`10.0.2.2`, que redireciona para o computador host:

```env
EXPO_PUBLIC_API_BASE_URL=https://10.0.2.2:7170/api
EXPO_PUBLIC_USER_PROFILE_ID=seu-guid-de-perfil
```

Se o certificado HTTPS local do ASP.NET Core nao for aceito no emulador, use a
porta HTTP de desenvolvimento da API:

```env
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:5113/api
EXPO_PUBLIC_USER_PROFILE_ID=seu-guid-de-perfil
```

### Dispositivo fisico na mesma rede

No celular, `localhost` aponta para o proprio aparelho, nao para o computador.
Use o IPv4 do computador onde a Forge.Api esta rodando:

```env
EXPO_PUBLIC_API_BASE_URL=https://192.168.0.100:7170/api
EXPO_PUBLIC_USER_PROFILE_ID=seu-guid-de-perfil
```

Substitua `192.168.0.100` pelo IPv4 real do computador. Para descobrir no
Windows:

```powershell
ipconfig
```

Procure o `Endereco IPv4` da placa conectada na mesma rede Wi-Fi/cabeada do
celular.

Celular e computador precisam estar na mesma rede local. O Firewall do Windows
pode bloquear a porta da API; nesse caso, libere a porta usada apenas para rede
privada/de desenvolvimento.

### HTTP e HTTPS local

A Forge.Api possui, no `launchSettings.json`, uma URL HTTPS local e uma URL HTTP
local de desenvolvimento:

```txt
https://localhost:7170
http://localhost:5113
```

Mantenha HTTPS como configuracao principal para Expo Web no mesmo computador.
Para dispositivo fisico, HTTPS local costuma falhar porque o celular nao confia
automaticamente no certificado de desenvolvimento do ASP.NET Core. A opcao mais
simples para demonstracao em rede local e usar HTTP na porta `5113`, sem trocar
a configuracao principal de HTTPS:

```env
EXPO_PUBLIC_API_BASE_URL=http://192.168.0.100:5113/api
```

Para expor a API na rede local, rode a Forge.Api escutando no IP da maquina ou
em todas as interfaces durante o desenvolvimento, por exemplo:

```powershell
dotnet run --project src\Forge.Api\Forge.Api.csproj --urls "http://0.0.0.0:5113"
```

Use tunel apenas quando precisar demonstrar fora da rede local ou evitar
configuracao de firewall/certificado.

### Reiniciar o Expo apos alterar `.env`

Variaveis `EXPO_PUBLIC_*` sao lidas no start do Expo. Depois de alterar `.env`,
reinicie limpando cache:

```bash
npx expo start -c
```

## Comandos uteis

```bash
npm install
npx expo start
npx tsc --noEmit
npm run lint
```
