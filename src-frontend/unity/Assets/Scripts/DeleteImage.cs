using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class DeleteImage : MonoBehaviour
{
    /// <summary>
    /// La imagen del objeto.
    /// </summary>
    public Imagen image;
    public ConexionAServidor conexionAServidor;
    void Start() {
        gameObject.AddComponent(typeof(BoxCollider2D));
    }
    
    void OnMouseOver() {
        if (Input.GetMouseButtonDown(1))
        {
            conexionAServidor.DeleteImageFromRoom(gameObject);
        }
    }
}
