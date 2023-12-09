using UnityEngine;
using System;

[Serializable]
public class Imagen
{
    /// <summary>
    /// La posición en el eje x de la imagen.
    /// </summary>
    public float posX;
    /// <summary>
    /// La posición en el eje y de la imagen.
    /// </summary>
    public float posY;
    /// <summary>
    /// La URL de la imagen.
    /// </summary>
    public string url;
    /// <summary>
    /// El constructor de una nueva imagen.
    /// </summary>
    /// <param name="posX">El valor que tendra posX.</param>
    /// <param name="posY">El valor que tendra posY.</param>
    /// <param name="url">El valor que tendra url.</param>
    public Imagen(float posX, float posY, string url)
    {
        this.posX = posX;
        this.posY = posY;
        this.url = url;
        
    }
    public override string ToString(){
        return @"{""posX"":""" + posX + @""", ""posY"":""" + posY + @""", ""url"":""" + url + @"""}";
    }
}
