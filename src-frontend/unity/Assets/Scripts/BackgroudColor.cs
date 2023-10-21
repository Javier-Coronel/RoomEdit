using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BackgroudColor : MonoBehaviour
{
    /// <summary>
    /// El color de fondo.
    /// </summary>
    public string color = "#000000";
       
    /// <summary>
    /// Cambia el color de fondo.
    /// </summary>
    /// <param name="color">El color al que se va ha cambiar.</param>
    public void ModifyColor(string color)
    {
        this.color = color;
        int[] intColor = {Convert.ToInt32(color.Substring(1,2), 16),Convert.ToInt32(color.Substring(3,2), 16),Convert.ToInt32(color.Substring(5,2), 16)};
        gameObject.GetComponent<SpriteRenderer>().color=new Color(intColor[0]/255f,intColor[1]/255f,intColor[2]/255f);
    }
}
