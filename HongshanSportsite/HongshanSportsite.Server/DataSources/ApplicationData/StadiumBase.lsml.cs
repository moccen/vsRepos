using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Microsoft.LightSwitch;
namespace LightSwitchApplication
{
    public partial class StadiumBase
    {
        partial void Name_Compute(ref string result)
        {
            // 将结果设置为所需的字段值
            if (this.Stadium != null&&this.Stadium.Name != null)
            {
                result = this.Stadium.Name;

            }
        }
    }
}
