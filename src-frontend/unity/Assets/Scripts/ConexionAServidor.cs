using System.Collections;
using System.Collections.Generic;
using UnityEngine.Networking;
using UnityEngine;
using System;
using System.Runtime.InteropServices;
using System.Globalization;

public class ConexionAServidor : MonoBehaviour
{
    /// <summary>
    /// Mide la posicion de la barra donde aparecen las imagenes.
    /// </summary>
    private float hSbarValue;
    /// <summary>
    /// Objeto con el cual se pondran las imagenes.
    /// </summary>
    private GameObject imagenAPoner;
    /// <summary>
    /// El orden en el que se posicionan las imagenes.
    /// </summary>
    private int orderOfImages = 1;
    /// <summary>
    /// El componente que gira el icono de carga.
    /// </summary>
    [Tooltip("El componente que gira el icono de carga.")]
    public Loading loading;
    /// <summary>
    /// El estilo de la GUI.
    /// </summary>
    [Tooltip("El estilo de la GUI.")]
    public GUISkin gUISkin;
    /// <summary>
    /// Imagen que ha seleccionado el usuario y que se va ha poner.
    /// </summary>
    private Texture2D imagen;
    /// <summary>
    /// URL del servidor que guarda las imagenes y la informacion de la sala.
    /// </summary>
    private string url;
    /// <summary>
    /// Id de la sala del usuario.
    /// </summary>
    private string roomid;
    /// <summary>
    /// La posicion del raton.
    /// </summary>
    private Vector3 posicionDeRaton;
    /// <summary>
    /// Lista en la que guardan las imagenes puestas por el usuario.
    /// </summary>
    private List<Imagen> imagenesToSave = new List<Imagen>();
    /// <summary>
    /// Lista de las URLs de las imagenes del servidor junto con las imagenes puestas como texturas.
    /// </summary>
    private List<UrlToTexture> UrlToTextures = new List<UrlToTexture>();
    /// <summary>
    /// Lista de texturas obtenidas a partir de las imagenes del servidor.
    /// </summary>
    private List<Texture2D> imagenes = new List<Texture2D>();
    /// <summary>
    /// El componente que cambia el color de fondo.
    /// </summary>
    [Tooltip("El componente que cambia el color de fondo.")]
    public BackgroudColor backgroudColor;
    /// <summary>
    /// Si esta activo enseña la GUI.
    /// </summary>
    private bool showGUI = false;
    /// <summary>
    /// La lista de imagenes que son consideradas innaccesibles pero que el usuario a puesto antes de ser innaccesibles.
    /// </summary>
    [Tooltip("Las imagenes inaccesibles")]
    public List<UrlToTexture> InaccessibleImages;
    /// <summary>
    /// El numero de imagenes que faltan por descargar.
    /// </summary>
    private int NumberOfImagesToDownload = 0;
    /// <summary>
    /// Detecta cuando se esta esperando la descarga de una imagen que es innacesible.
    /// </summary>
    private bool WaitingForInaccessibleImage = true;
    /// <summary>
    /// Metodo para comprobar que la parte de unity se ha iniciado para pedir datos a la pagina web.
    /// </summary>
    [DllImport("__Internal")]
    private static extern void UnityIsReady();

    // Start is called before the first frame update
    void Start()
    {
        ChangeInputMode();
        #if !UNITY_EDITOR && UNITY_WEBGL
            UnityIsReady();
        #elif UNITY_EDITOR
            CheckUrl("http://localhost:5000");
            roomid = "645c3a1870fb865a1596c843";
        #endif
        imagenAPoner = new GameObject("imagenAPoner", typeof(SpriteRenderer));
        imagenAPoner.GetComponent<SpriteRenderer>().sortingOrder = 32767;
    }

    // Update is called once per frame
    void Update()
    {
        if (imagen != null)
        {
            posicionDeRaton = Camera.main.ScreenToWorldPoint(Input.mousePosition);

            imagenAPoner.transform.position = new Vector2(posicionDeRaton.x, posicionDeRaton.y);
            if (Input.GetKeyDown(KeyCode.Mouse0) && posicionDeRaton.y < Camera.main.ScreenToWorldPoint(new Vector3(0, Screen.height - (1f / 24f * Screen.height), 0)).y)
            {
                UrlToTexture urlAndTexture = UrlToTextures.Find(x => x.texture.Equals(imagen));
                AddAImage(imagenAPoner.transform.position, imagen, urlAndTexture.getUrl());
                Debug.Log(imagenesToSave.ToString());
                imagen = null;
                imagenAPoner.GetComponent<SpriteRenderer>().sprite = null;
                imagenAPoner.SetActive(false);
                SaveRoom();
            }
        }

    }

    /// <summary>
    /// Añade una imagen a la escena y a la lista de imagenes para guardar.
    /// </summary>
    /// <param name="pos">La posicion de la imagen.</param>
    /// <param name="imagen">La textura de la imagen.</param>
    /// <param name="url">La URL de la cual se a obtenido la imagen.</param>
    void AddAImage(Vector3 pos, Texture2D imagen, string url)
    {
        GameObject gameObject = new GameObject("img", typeof(SpriteRenderer));
        gameObject.transform.position = pos;
        gameObject.GetComponent<SpriteRenderer>().sprite = Sprite.Create(imagen, new Rect(new Vector2(0, 0), new Vector2(imagen.width, imagen.height)), new Vector2(0.5f, 0.5f));
        gameObject.GetComponent<SpriteRenderer>().size = new Vector2(1, 1);
        Imagen imageOfObject = new Imagen(gameObject.transform.position.x, gameObject.transform.position.y, url);
        gameObject.AddComponent(typeof(DeleteImage));
        gameObject.GetComponent<DeleteImage>().image = imageOfObject;
        gameObject.GetComponent<DeleteImage>().conexionAServidor = this.gameObject.GetComponent<ConexionAServidor>();
        imagenesToSave.Add(imageOfObject);
        gameObject.GetComponent<SpriteRenderer>().sortingOrder = -32767 + orderOfImages++;
    }

    // OnGUI es llamado varias veces por frame y sirve para renderizar y manejar los eventos de la interfaz.
    private void OnGUI()
    {
        if (showGUI)
        {
            GUI.skin = gUISkin;
            int a = 0;
            float[] valoresDePantalla = {/*100/640=*/0.15625f * Screen.width, /*20/640=*/0.03125f * Screen.width, /*20/480=*/1f / 24f * Screen.height, /*80/640=*/0.125f * Screen.width, /*115/480=*/23f / 96f * Screen.height, /*31/32=*/0.9375f * Screen.width };
            GUI.Box(new Rect(0, 0, 1.1f * Screen.width, 0.3f * Screen.height), Texture2D.whiteTexture);
            hSbarValue = GUI.HorizontalScrollbar(new Rect(new Vector2(valoresDePantalla[1], valoresDePantalla[4]), new Vector2(valoresDePantalla[5], 1 / 48 * Screen.height)), hSbarValue, 6, 0f, imagenes.Count + ((imagenes.Count >= 7) ? (imagenes.Count - 7) * 0.25f : 0));
            if (imagenes.ToArray().Length != 0)
            {
                foreach (Texture2D img in imagenes)
                {
                    if (GUI.Button(new Rect(a * valoresDePantalla[0] + valoresDePantalla[1] - (hSbarValue / 8f * Screen.width), valoresDePantalla[2], valoresDePantalla[3], valoresDePantalla[3]), img))
                    {
                        imagen = img;
                        imagenAPoner.GetComponent<SpriteRenderer>().sprite = Sprite.Create(imagen, new Rect(new Vector2(0, 0), new Vector2(imagen.width, imagen.height)), new Vector2(0.5f, 0.5f));
                        imagenAPoner.GetComponent<SpriteRenderer>().size = new Vector2(1, 1);
                    }
                    a++;
                }
            }
            else
            {
                GUI.Label(new Rect(0, 0, 1.1f * Screen.width, 0.3f * Screen.height),"Actualmente no hay imagenes que se puedan poner.", gUISkin.label);
            }

        }
    }

    /// <summary>
    /// Carga las imagenes desde el servidor a partir de un array de strings con URLs.
    /// </summary>
    /// <param name="cadenaDeURLS">El array de strings con la que se obtendran las imagenes.</param>
    private void LoadImages(string[] cadenaDeURLS)
    {
        foreach (string url in cadenaDeURLS)
        {
            StartCoroutine(LoadImageFromURL(url));
        }
    }

    /// <summary>
    /// Hace que la pagina web reciba los inputs del teclado o que solo los reciba el contenido de unity. 
    /// </summary>
    void ChangeInputMode()
    {
        #if !UNITY_EDITOR && UNITY_WEBGL
            WebGLInput.captureAllKeyboardInput=!WebGLInput.captureAllKeyboardInput;
        #endif
    }

    /// <summary>
    /// Llama a la corutina que guarda la sala en la base de datos.
    /// </summary>
    private void SaveRoom()
    {
        StartCoroutine(UploadRoom());
    }

    /// <summary>
    /// Guarda la sala en la base de datos y hace una imagen de la salapara guararla en la parte del servidor.
    /// </summary>
    IEnumerator UploadRoom()
    {
        yield return new WaitForEndOfFrame();
        Texture2D texture = ScreenCapture.CaptureScreenshotAsTexture();
        imagenAPoner.SetActive(true);
        Debug.Log((int)(0.3f * Screen.height));
        Color[] pixels = texture.GetPixels(0, 0, Screen.width, (int)(0.7f * Screen.height));
        Texture2D newTexture = new Texture2D(Screen.width, (int)(0.7f * Screen.height));
        newTexture.SetPixels(pixels);
        newTexture.Apply();
        byte[] bytes = newTexture.EncodeToPNG();

        WWWForm form = new WWWForm();
        string stringOfImages = "[";
        Array.ForEach(imagenesToSave.ToArray(), (element) =>
        {
            stringOfImages = stringOfImages + element.ToString() + ",";
        });
        stringOfImages = stringOfImages.Remove(stringOfImages.Length - 1, 1) + "]";
        form.AddField("images", stringOfImages);
        #if !UNITY_EDITOR && UNITY_WEBGL
            form.AddField("roomcode",roomid);
        #elif UNITY_EDITOR
            form.AddField("roomcode", "645c3a1870fb865a1596c843");
        #endif
        form.AddField("BackgroudColor", backgroudColor.color.Replace("}", ""));
        form.AddBinaryData("image", bytes);
        Debug.Log(stringOfImages);
        UnityWebRequest post = UnityWebRequest.Post(url + "/rooms/updateRoom/", form);
        post.SetRequestHeader("Access-Control-Allow-Headers", "Content-Type");
        post.SetRequestHeader("Access-Control-Allow-Origin", "*");
        yield return post.SendWebRequest();
        if (post.isNetworkError || post.isHttpError)
        {
            Debug.Log(post.error);
        }
        else
        {
            Debug.Log("");
        }
    }

    /// <summary>
    /// Carga una imagen del servidor a partir de la URL dada.
    /// </summary>
    /// <param name="url">La URL de la imagen.</param>
    IEnumerator LoadImageFromURL(string url)
    {
        UnityWebRequest request = UnityWebRequestTexture.GetTexture(url);
        request.SetRequestHeader("Access-Control-Expose-Headers", "*");
        yield return request.SendWebRequest();
        if (request.isNetworkError || request.isHttpError)
        {
            Debug.Log(request.error);
        }
        else
        {
            imagenes.Add(((DownloadHandlerTexture)request.downloadHandler).texture);
            UrlToTextures.Add(new UrlToTexture(((DownloadHandlerTexture)request.downloadHandler).texture, url.Remove(0, this.url.Length)));
            Debug.Log(url);

        }
    }

    /// <summary>
    /// Elimina una imagen de la sala, esto incluye al objeto en la escena, y guarda la sala.
    /// </summary>
    /// <param name="obj">El objeto que contiene la imagen.</param>
    public void DeleteImageFromRoom(GameObject obj)
    {
        DeleteImage deleteImage = obj.GetComponent<DeleteImage>();
        imagenesToSave.Remove(deleteImage.image);
        Destroy(obj);
        SaveRoom();
    }

    /// <summary>
    /// Obtiene todas las imagenes accesibles.
    /// </summary>
    /// <param name="url">La url donde esta localizado el backend de la aplicación.</param>
    IEnumerator DownloadfromURL(string url)
    {
        UnityWebRequest request = UnityWebRequest.Get(url + "/images/names");
        yield return request.SendWebRequest();
        if (request.isNetworkError || request.isHttpError)
        {
            Debug.Log(request.error);
        }
        else
        {
            string[] a = request.downloadHandler.text.Replace("{\"name\":\"", url + "/images/").Replace("\"}", "").Replace("[", "").Replace("]", "").Split(',');
            Debug.Log(request.downloadHandler.text.Replace("{\"name\":\"", url + "/images/").Replace("\"}", "").Replace("[", "").Replace("]", ""));

            if (a[0] != "")
            {
                LoadImages(a);
                StartCoroutine(DownloadDataOfRoom(a.Length));
            }
            else
            {
                StartCoroutine(DownloadDataOfRoom(0));
            }

        }
    }

    /// <summary>
    /// Espera a que todas las imagenes esten cargadas, entonces carga la sala del usuario.
    /// </summary>
    /// <param name="Length">La cantidad de imagenes que imagenes que se tienen que cargar.</param>
    IEnumerator DownloadDataOfRoom(int Length)
    {
        do
        {
            yield return new WaitForSeconds(0.5f);
            if (Length == imagenes.ToArray().Length)
            {
                UnityWebRequest request = UnityWebRequest.Get(url + "/rooms/userRoom/" + roomid);
                yield return request.SendWebRequest();
                if (request.isNetworkError || request.isHttpError)
                {
                    Debug.Log(request.error);
                    NumberOfImagesToDownload=0;
                }
                else
                {
                    Debug.Log(request.downloadHandler.text);
                    string[] splitString = { "},{" };
                    string[] imagesInRoom = request.downloadHandler.text.Split(splitString, System.StringSplitOptions.None);
                    Debug.Log(imagesInRoom.Length);
                    Debug.Log(imagesInRoom[0].Substring(12, 2));
                    if (imagesInRoom.Length != 1 || imagesInRoom[0].Substring(12, 2) != "[]")
                    {
                        NumberOfImagesToDownload = imagesInRoom.Length;
                        Array.ForEach(imagesInRoom, (element) =>
                        {
                            StartCoroutine(LoadImagesAndColorOfRoom(element, imagesInRoom));
                        });
                    }
                    else
                    {
                        NumberOfImagesToDownload = 0;
                        backgroudColor.ModifyColor("#" + imagesInRoom[0].Replace(@"""}", "").Split(new char[] { '#' })[1]);
                    }
                }
                
            }
        } while (Length != imagenes.ToArray().Length);

        while (NumberOfImagesToDownload!=0)
        {
            yield return new WaitForSeconds(0.5f);
        }
        showGUI = true;
        loading.EndLoading();
    }

    /// <summary>
    /// Carga las imagenes y el color de la sala en la escena.
    /// </summary>
    /// <param name="element">La imagen, o el color, que se va a poner en la escena.</param>
    /// <param name="imagesInRoom">El array con las imagenes, y sus posiciones, y el color de la sala.</param>
    IEnumerator LoadImagesAndColorOfRoom(string element, string[] imagesInRoom)
    {
        string[] elementValues = element.Replace("\",\"", "|").Replace("posX", "").Replace("posY", "").Replace("url", "").Replace("\"", "")
                                                            .Replace(":", "").Replace("[", "").Replace("{", "").Replace("Imagenes", "").Replace(",", ".").Split(new char[] { '|' }, System.StringSplitOptions.None);
        Debug.Log(elementValues[0] + elementValues[1] + elementValues[2]);
        Vector3 pos = new Vector3(float.Parse(elementValues[0], CultureInfo.InvariantCulture.NumberFormat), float.Parse(elementValues[1], CultureInfo.InvariantCulture.NumberFormat), imagenAPoner.transform.position.z);
        Debug.Log(UrlToTextures.Find(x => x.url.Equals(elementValues[2])) != null);

        Texture2D textureOfElement;
        if (UrlToTextures.Find(x => x.url.Equals(elementValues[2])) != null)
        {
            textureOfElement = UrlToTextures.Find(x => x.url.Equals(elementValues[2])).texture;
        }
        else
        {
            WaitingForInaccessibleImage = true;
            StartCoroutine(GetANonaccessImage(elementValues[2]));
            do
            {
                yield return new WaitForSeconds(1f);
            } while (WaitingForInaccessibleImage);
            textureOfElement = new Texture2D(1, 1);
            int tryGetImage = 0;
            while (tryGetImage < 3)
            {
                try
                {
                    textureOfElement = InaccessibleImages.Find((x) => x.url.Equals(elementValues[2])).texture;
                    tryGetImage = 3;
                }
                catch (System.Exception)
                {
                    tryGetImage++;
                }
                yield return new WaitForSeconds(0.5f);
            }
        }
        AddAImage(pos, textureOfElement, elementValues[2]);
        if (element == imagesInRoom[imagesInRoom.Length - 1])
        {
            backgroudColor.ModifyColor("#" + elementValues[3].Split(new char[] { '#' })[1]);
        }
        NumberOfImagesToDownload--;
    }

    /// <summary>
    /// Obtiene una imagen que no es accesible para poner por el usuario, pero que anteriormente habia puesto en su sala.
    /// </summary>
    /// <param name="imageLocation">URL donde esta la imagen.</param>
    /// <returns></returns>
    IEnumerator GetANonaccessImage(string imageLocation)
    {
        Debug.Log(imageLocation);
        UnityWebRequest requestOfNonaccessImage = UnityWebRequestTexture.GetTexture(url + imageLocation);
        requestOfNonaccessImage.SetRequestHeader("Access-Control-Expose-Headers", "*");
        yield return requestOfNonaccessImage.SendWebRequest();
        if (requestOfNonaccessImage.isNetworkError || requestOfNonaccessImage.isHttpError)
        {
            Debug.Log(requestOfNonaccessImage.error);
        }
        else
        {
            Debug.Log(imageLocation + "" + ((DownloadHandlerTexture)requestOfNonaccessImage.downloadHandler).texture);
            InaccessibleImages.Add(new UrlToTexture(((DownloadHandlerTexture)requestOfNonaccessImage.downloadHandler).texture, imageLocation));
        }
        WaitingForInaccessibleImage = false;
    }

    /// <summary>
    /// Obtiene las imagenes de la URL pasada.
    /// </summary>
    /// <param name="url">La URL de donde provienen las imagenes.</param>
    void CheckUrl(string url)
    {
        this.url = url;
        Debug.Log("Url es: " + url);
        StartCoroutine(DownloadfromURL(url));
    }

    /// <sumary>
    /// Obtiene el id de la sala, a partir de la pagina web.
    /// </sumary>
    /// <param name="roomId">El id de la sala pasado por la pagina web.</param>
    void setRoomId(string roomId)
    {
        this.roomid = roomId;
    }

    /// <summary>
    /// Cambia el color de fondo y guarda la sala.
    /// </summary>
    /// <param name="color">El color que tendra la sala de fondo.</param>
    void setBackgroudColor(string color)
    {
        backgroudColor.ModifyColor(color);
        SaveRoom();
    }
}

/// <summary>
/// La relaccion entre la imagen como tal y la URL donde esta la imagen.
/// </summary>
[Serializable]
public class UrlToTexture
{
    /// <summary>
    /// La textura que contiene la imagen.
    /// </summary>
    public Texture2D texture;
    /// <summary>
    /// La URL donde esta la imagen.
    /// </summary>
    public string url;
    public UrlToTexture(Texture2D texture, string url)
    {
        this.texture = texture;
        this.url = url;
    }
    public string getUrl()
    {
        return this.url;
    }
    public Texture2D getTexture()
    {
        return this.texture;
    }
}
