# rest-request
## Особенности:
* Автопарсинг JSON
* Возможность остановки запроса
* Основано на промисах
* Установка строки параметров за счет передаваемого объекта
* Множество опций для настройки Ваших запросов
* После создания экземпляра класса доступы 5 самых популярных типа запроса. Также есть возможность добавления своего типа запроса
***
## Установка:

 `npm i @red_fox107/rest-request`

 `yarn add @red_fox107/rest-request`

***

## Настройки доступные при создании экземпляра класса

```
const exmpl = new REST_request(
    {
        commonBodyParams = {
            param1:123,
            param2:321
        }, - 
        headers = {
            "API-KEY":"23Tbdf5"
        },
        withCredentials = false,
        baseUrl = 'http://someURL/',
        responseDataType = 'json',
        commonSearchParams = {
            id:1235
        },
        withAbort = false
    }
)
```
### Пояснение:
**_Все установленные параметры будут применятся ко всем запросам_**
* `commonBodyParams` - общее тело запроса, не применяется к GET. Передаваемый тип данных `object`.
* `headers` - Заголовки запроса. Передаваемый тип данных `object`.
* `withCredentials` - захват данных при запросе. Передаваемый тип данных `boolean`.
* `baseUrl` - общий URL. Передаваемый тип данных `string` или `object URL`.
* `responseDataType` - тип получаемых данных. Передаваемый тип данных `string`.
* `commonSearchParams` - общая строка параметров. Передаваемый тип данных `object`.
* `withAbort` - При данной настройке помимо промиса возвращается `abortId` за счет котрого можно остановить запрос(Пример будет приведен ниже). Передаваемый тип данных `boolean`.

**_Также данные настройки можно определить и/или переопределить в самом запросе_**
### Работа с настройкой `withAbort`
```
const test = new REST_request({withAbort:true,baseUrl:'http://someUrl'});

const exmpl = async ()=>{
try{
    const [promise,abortId] = test.get('/file.json');
    test.abort(abortId);
    const {response,status} = await promise;
    
return reponse;
}catch(e){
    console.log(e);//{status: 0, error: "Request aborted"}
}
exmpl();
}
```
### Работа с параметрами и настройками в самих запросах
***Шаблон для всех запросов `restRequest.[req](url,data,options)`***

**_Параметры `commonSearchParams`,`commonBodyParams`,`baseUrl` в данный момент не доступны_**

**_Однако для всех запросов кроме `get` доступен параметр `searchParams` симулирующий поведение `get`_**
```
const test = new REST_request({baseUrl:'http://someUrl'});

test.get('/getFile',{fileName:"file",ext:"json"},{withCredentials:true}).then(...)//url = http://someUrl/getFile?fileName=file&ext=json

test.post('/getFile',{KEY:8952},{searchParams:{fileName:"file",ext:"json"},withAbort:false}).then(...))

```
### Создание своего типа запросов
В только что созданном экземпляре класса доступны 5 типов запросов:
1. `GET`
2. `POST`
3. `PUT`
4. `UPDATE`
5. `DELETE`

Для создания своего типа существует метод `addCustomMethod` в который передается тип запросов.

После объявления работа с новым типом ничем не отличается от заранее заданных.
```
const exmpl = new REST_request({baseUrl:"http://someUrl"});

exmpl.addCustomMethod('head');

exmpl.head('/index.php',{},{withAbort:false}) 
```

