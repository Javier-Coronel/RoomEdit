using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Loading : MonoBehaviour
{
    /// <summary>
    /// El angulo con el que gira el icono.
    /// </summary>
    private float angle = 0f;
    // Update is called once per frame
    void Update()
    {
        angle -= Time.deltaTime * 150;
        transform.rotation = Quaternion.Euler(0,0,angle);
        if(angle<=-360){
            angle = 0;
        }
    }
    /// <summary>
    /// Elimina el icono de carga.
    /// </summary>
    public void EndLoading(){
        Destroy(gameObject);
    }
}
