using System;
using System.Linq;
using System.IO;
using System.IO.IsolatedStorage;
using System.Collections.Generic;
using Microsoft.LightSwitch;
using Microsoft.LightSwitch.Framework.Client;
using Microsoft.LightSwitch.Presentation;
using Microsoft.LightSwitch.Presentation.Extensions;
namespace LightSwitchApplication
{
    public partial class EditableStadiumSetGrid
    {
        partial void gridAddAndEditNew_CanExecute(ref bool result)
        {
            // 在此编写您的代码。

        }

        //当添加场馆后，自动添加场馆基本信息
        partial void gridAddAndEditNew_Execute()
        {
            // 在此编写您的代码。
            this.StadiumSet.AddAndEditNew();
            var stadiumBase = this.DataWorkspace.ApplicationData.StadiumBaseSet.AddNew();
            stadiumBase.Stadium = this.StadiumSet.SelectedItem;
        }
    }
}
